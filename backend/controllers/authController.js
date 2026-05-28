const https = require("https");
const querystring = require("querystring");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { google } = require("googleapis");

function fetchGoogleUser(accessToken) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: "www.googleapis.com",
            path: "/oauth2/v3/userinfo",
            headers: { Authorization: `Bearer ${accessToken}` },
        };
        https.get(options, (res) => {
            let raw = "";
            res.on("data", (chunk) => { raw += chunk; });
            res.on("end", () => {
                try { resolve(JSON.parse(raw)); }
                catch (e) { reject(e); }
            });
        }).on("error", reject);
    });
}

function exchangeCodeForToken(code) {
    return new Promise((resolve, reject) => {
        const body = querystring.stringify({
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
            grant_type: "authorization_code",
        });
        const options = {
            hostname: "oauth2.googleapis.com",
            path: "/token",
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Content-Length": Buffer.byteLength(body),
            },
        };
        const req = https.request(options, (res) => {
            let raw = "";
            res.on("data", (chunk) => { raw += chunk; });
            res.on("end", () => {
                try { resolve(JSON.parse(raw)); }
                catch (e) { reject(e); }
            });
        });
        req.on("error", reject);
        req.write(body);
        req.end();
    });
}

exports.register = async (req, res) => {
    try {
        const { email, password, role, name } = req.body;

        const passwordRegex = /^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ 
                message: "Password must be at least 6 characters and include at least one special character." 
            });
        }

        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: "Email already registered" });

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({
            name: name || email.split("@")[0],
            email,
            password: hashed,
            role: role || "alumni",
        });

        res.status(201).json({ message: "Account created successfully!", user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: "Invalid password" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role,} });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.googleAuthRedirect = (req, res) => {
    const { role } = req.query;
    const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        response_type: "code",
        scope: "openid email profile",
        access_type: "offline",
        state: role || "alumni",
        prompt: "select_account",
    });
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
};

exports.googleAuthCallback = async (req, res) => {
    const { code, state: role, error } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    console.log('🔐 Google Callback Received');
    console.log('  - Code:', code ? 'Present' : 'MISSING');
    console.log('  - State (role):', role || 'MISSING');
    console.log('  - Error from Google:', error);
    console.log('  - Frontend URL:', frontendUrl);

    if (error || !code) {
        console.log('❌ Returning cancelled callback');
        return res.redirect(`${frontendUrl}/auth/callback?error=cancelled`);
    }

    try {
        const tokenData = await exchangeCodeForToken(code);
        console.log('  - Token exchange result:', tokenData.error ? 'ERROR' : 'SUCCESS');
        
        if (tokenData.error) {
            console.log('    - Error details:', tokenData.error, tokenData.error_description);
            return res.redirect(`${frontendUrl}/auth/callback?error=token_failed`);
        }

        const googleUser = await fetchGoogleUser(tokenData.access_token);
        console.log('  - Google user:', googleUser.email);
        
        if (!googleUser.email) {
            console.log('❌ No email in Google response');
            return res.redirect(`${frontendUrl}/auth/callback?error=no_email`);
        }

        let user = await User.findOne({ email: googleUser.email });
        console.log('  - DB User found:', user ? 'YES' : 'NO');

        if (!user) {
            if (role !== "alumni") {
                console.log('❌ Non-alumni cannot auto-create account');
                return res.redirect(`${frontendUrl}/auth/callback?error=no_account`);
            }
            user = await User.create({
                name: googleUser.name || googleUser.email.split("@")[0],
                email: googleUser.email,
                role: "alumni",
            });
            console.log('  - New user created:', user.email);
        }

        if (role && user.role !== role) {
            console.log('❌ Role mismatch. Expected:', role, 'Got:', user.role);
            return res.redirect(`${frontendUrl}/auth/callback?error=wrong_role`);
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        const userDataObj = {
            id: user._id.toString(), 
            name: user.name, 
            email: user.email, 
            role: user.role,
        };
        console.log('  - User object:', userDataObj);
        const userData = encodeURIComponent(JSON.stringify(userDataObj));
        
        const redirectUrl = `${frontendUrl}/auth/callback?token=${token}&user=${userData}`;
        console.log('✅ Redirect URL construction:');
        console.log('   Token:', token.substring(0, 50) + '...');
        console.log('   User data (encoded):', userData.substring(0, 100) + '...');
        console.log('   Full URL:', redirectUrl);
        console.log('   URL length:', redirectUrl.length);
        res.redirect(redirectUrl);
    } catch (err) {
        console.error('❌ Callback error:', err.message);
        res.redirect(`${frontendUrl}/auth/callback?error=server_error`);
    }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() } 
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }

    const bcrypt = require("bcryptjs");
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.status(200).json({ message: 'Password reset successful.' });
  } catch (error) {
    console.error('Reset password handler error:', error);
    return res.status(500).json({ message: 'Internal server error processing password reset.' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ message: 'Email and portal role are required.' });
    }

    const normalizedRole = role.toLowerCase().trim();

    const user = await User.findOne({ 
      email: email.toLowerCase().trim(), 
      role: normalizedRole 
    });
    
if (!user) {
  return res.status(404).json({ 
    message: `No account found with that email registered under the ${role} portal.` 
  });
}

    const resetToken = require("crypto").randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; 
    await user.save();

    const oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN, 
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const emailLines = [
      `From: "XU Alumni Relations Office" <${process.env.EMAIL_USER}>`,
      `To: ${user.email}`,
      `Subject: Password Reset Request - Alumni Management System`,
      `Content-Type: text/html; charset=utf-8`,
      `MIME-Version: 1.0`,
      ``,
      `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">`,
      `  <h2 style="color: #283971;">Password Reset Request</h2>`,
      `  <p>Hello ${user.name || 'User'},</p>`,
      `  <p>You requested a password reset for your account on the Xavier University Alumni Management System portal.</p>`,
      `  <p>Please click the button below to set up a new password. This link will expire in 1 hour:</p>`,
      `  <div style="margin: 24px 0;">`,
      `    <a href="${resetUrl}" style="background-color: #283971; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px;">Reset Password</a>`,
      `  </div>`,
      `  <p style="font-size: 11px; color: #6b7280;">If you didn't request this, you can safely ignore this email.</p>`,
      `</div>`
    ];

    const rawEmail = emailLines.join('\r\n');

    const encodedEmail = Buffer.from(rawEmail)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail,
      },
    });

    return res.status(200).json({ message: 'Password reset link has been sent to your email.' });
  } catch (error) {
    console.error('Gmail API Forgot password error:', error);
    return res.status(500).json({ message: 'Internal server error processing email.' });
  }
};