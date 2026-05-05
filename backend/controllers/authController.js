const https = require("https");
const querystring = require("querystring");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

    if (error || !code) {
        return res.redirect(`${frontendUrl}/auth/callback?error=cancelled`);
    }

    try {
        const tokenData = await exchangeCodeForToken(code);
        if (tokenData.error) {
            return res.redirect(`${frontendUrl}/auth/callback?error=token_failed`);
        }

        const googleUser = await fetchGoogleUser(tokenData.access_token);
        if (!googleUser.email) {
            return res.redirect(`${frontendUrl}/auth/callback?error=no_email`);
        }

        let user = await User.findOne({ email: googleUser.email });

        if (!user) {
            if (role !== "alumni") {
                return res.redirect(`${frontendUrl}/auth/callback?error=no_account`);
            }
            user = await User.create({
                name: googleUser.name || googleUser.email.split("@")[0],
                email: googleUser.email,
                role: "alumni",
            });
        }

        if (role && user.role !== role) {
            return res.redirect(`${frontendUrl}/auth/callback?error=wrong_role`);
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        const userData = encodeURIComponent(JSON.stringify({
            id: user._id, name: user.name, email: user.email, role: user.role,
        }));
        res.redirect(`${frontendUrl}/auth/callback?token=${token}&user=${userData}`);
    } catch (err) {
        res.redirect(`${frontendUrl}/auth/callback?error=server_error`);
    }
};
