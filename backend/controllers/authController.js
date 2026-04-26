const https = require("https");
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

exports.register = async (req, res) => {
    try {
        const { email, password, role, name } = req.body;

        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: "Email already registered" });

        const hashed = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name || email.split("@")[0],
            email,
            password: hashed,
            role: role || "alumni",
        });

        res.status(201).json({ message: "Registered successfully", user });
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
        res.json({ token, user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.googleLogin = async (req, res) => {
    try {
        const { access_token, role } = req.body;

        const googleUser = await fetchGoogleUser(access_token);
        if (!googleUser.email) {
            return res.status(400).json({ message: "Could not retrieve Google account info" });
        }

        let user = await User.findOne({ email: googleUser.email });
        if (!user) {
            user = await User.create({
                name: googleUser.name || googleUser.email.split("@")[0],
                email: googleUser.email,
                password: await bcrypt.hash(Math.random().toString(36) + Date.now(), 10),
                role: role || "alumni",
            });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.json({ token, user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
