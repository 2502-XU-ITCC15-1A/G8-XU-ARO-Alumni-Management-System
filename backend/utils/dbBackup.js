const mongoose = require('mongoose');
const { google } = require('googleapis');
const { Readable } = require('stream');
const SystemLog = require('../models/SystemLog');

const oauth2Client = new google.auth.OAuth2(
  process.env.DRIVE_CLIENT_ID,
  process.env.DRIVE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.DRIVE_REFRESH_TOKEN,
});

const drive = google.drive({ version: 'v3', auth: oauth2Client });

async function executeSystemBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const folderName = `snapshot-${timestamp}`;
  
  try {
    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve) => mongoose.connection.once('open', resolve));
    }

    console.log(`[BACKUP ENGINE] Initializing Stream with Personal OAuth2 Identity...`);
    
    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    };

    const driveFolder = await drive.files.create({
      resource: folderMetadata,
      fields: 'id',
    });
    
    const remoteFolderId = driveFolder.data.id;
    const collections = Object.keys(mongoose.connection.collections);

    for (const collectionName of collections) {
      const data = await mongoose.connection.db.collection(collectionName).find({}).toArray();
      const bufferStream = new Readable();
      bufferStream.push(JSON.stringify(data, null, 2));
      bufferStream.push(null);

      await drive.files.create({
        resource: { name: `${collectionName}.json`, parents: [remoteFolderId] },
        media: { mimeType: 'application/json', body: bufferStream },
        fields: 'id',
      });
      console.log(`   ✔ Uploaded [${collectionName}].`);
    }
    
    console.log(`[BACKUP ENGINE] Success! Snapshot created in Google Drive.`);
    await SystemLog.create({
      action: "DATABASE_BACKUP",
      performedBy: {
        userId: null,
        name: "Automated System Task",
        role: "system"
      },
      target: folderName,
      details: `Successfully backed up ${collections.length} collections to Google Drive cloud core structure.`
    });

    return { success: true };
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.message;
    console.error('[BACKUP ENGINE] OAuth Error:', errorMsg);

    try {
      await SystemLog.create({
        action: "DATABASE_BACKUP_FAILED",
        performedBy: {
          userId: null,
          name: "Automated System Task",
          role: "system"
        },
        target: folderName,
        details: `Cloud synchronization runtime failure: ${errorMsg}`
      });
    } catch (logError) {
      console.error('Failed to log backup error to database:', logError.message);
    }

    return { success: false };
  }
}

module.exports = { executeSystemBackup };