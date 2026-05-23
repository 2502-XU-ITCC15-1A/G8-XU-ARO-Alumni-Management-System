const mongoose = require('mongoose');
const { google } = require('googleapis');
const { Readable } = require('stream');

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
    return { success: true };
  } catch (error) {
    console.error('[BACKUP ENGINE] OAuth Error:', error.response?.data?.error || error.message);
    return { success: false };
  }
}

module.exports = { executeSystemBackup };