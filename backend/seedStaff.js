require("dotenv").config({ path: __dirname + "/.env" })

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const staffAccounts = [
    //aro admin acc/accs
    {
        name: "ARO Admin",
        email: "aro@xu.edu.ph",
        password: "aro@2026",
        role: "xu-aro",
    },
    //book center staff acc
    {
        name: "Book Center Staff",
        email: "bookcenter@xu.edu.ph",
        password: "bookcenter@2026",
        role: "external",
    },
    
];

async function seedStaff() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");

        for (const staff of staffAccounts) {
            const exists = await User.findOne({ email: staff.email });
            if (exists) {
                console.log(`Account already exists: ${staff.email}`);
                continue;
            }

            const hashed = await bcrypt.hash(staff.password, 10);
            await User.create({ ...staff, password: hashed });
            console.log(`Created: ${staff.email} (${staff.role})`);
        }

        console.log("\nStaff accounts are ready:");
        console.log("ARO Staff:    aro@xu.edu.ph        / aro@2026");
        console.log("Book Center:  bookcenter@xu.edu.ph / bookcenter@2026");
    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        mongoose.disconnect();
    }
}

seedStaff();