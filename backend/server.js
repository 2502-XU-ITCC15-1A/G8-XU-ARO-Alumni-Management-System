require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cron = require("node-cron");
const { executeSystemBackup } = require('./utils/dbBackup');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',                   
  'https://aro-alumni-backend.onrender.com' 
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static('uploads'));

const isMaintenanceMode = false;

mongoose.connect(process.env.MONGO_URI)
    .then(async () => { 
        console.log("MongoDB Connected Successfully");
        require('./utils/logArchiver');
        
        console.log("[AUTOMATION] Server booted. Running immediate backup engine synchronization test...");
        try {
            await executeSystemBackup();
        } catch (testError) {
            console.error("[AUTOMATION] Startup backup test encountered an error:", testError);
        }
        
        cron.schedule('0 0 * * *', async () => {
            console.log("[AUTOMATION] Midnight clock struck! Initiating automatic cloud backup to Google Drive...");
            try {
                await executeSystemBackup();
            } catch (backupError) {
                console.error("[AUTOMATION] Automated backup job encountered an error:", backupError);
            }
        }, {
            scheduled: true,
            timezone: "Asia/Manila" 
        });
    })
    .catch(err => console.error("Database connection failure:", err));

app.use('/api/applications', require('./routes/applications'));
app.use("/api/system-logs",  require("./routes/systemLogsRoutes"));
app.use("/api/auth",         require("./routes/authRoutes"));
app.use("/api/alumni",       require("./routes/alumniRoutes"));
app.use("/api/education",    require("./routes/educationRoutes"));
app.use("/api/work",         require("./routes/workRoutes"));
app.use("/api/IdApplication",require("./routes/IdApplicationRoutes"));
app.use("/api/users",        require("./routes/userRoutes"));
app.use("/api/bookcenter",   require("./routes/bookCenterRoutes"));
app.use("/api/notifications",require("./routes/notificationRoutes"));

app.get("/", (req, res) => {
    res.send("Backend Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});