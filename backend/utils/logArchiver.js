const cron = require('node-cron');
const mongoose = require('mongoose');

const SystemLog = mongoose.model('SystemLog');
const Application = mongoose.model('Application');

const ArchivedLog = mongoose.model(
  'ArchivedLog', 
  SystemLog.schema, 
  'archived_system_logs'
);

const ArchivedApplication = mongoose.model(
  'ArchivedApplication',
  Application.schema,
  'archived_applications'
);

cron.schedule('0 0 * * 0', async () => {
  try {
    const logCutoff = new Date();
    logCutoff.setDate(logCutoff.getDate() - 30);

    const oldLogs = await SystemLog.find({ createdAt: { $lt: logCutoff } });

    if (oldLogs.length > 0) {
      console.log(`[ARCHIVER] Sunday cleanup triggered. Found ${oldLogs.length} logs older than 30 days. Archiving...`);
      await ArchivedLog.insertMany(oldLogs);
      const deleteLogsResult = await SystemLog.deleteMany({ createdAt: { $lt: logCutoff } });
      console.log(`[ARCHIVER] Weekly backup complete. ${deleteLogsResult.deletedCount} items safely moved to cold storage.`);
    }

    const today = new Date();

    const expiredApplications = await Application.find({
      status: 'released',
      validUntil: { $lt: today }
    });

    if (expiredApplications.length > 0) {
      console.log(`[ARCHIVER] Found ${expiredApplications.length} expired alumni applications. Archiving...`);
      await ArchivedApplication.insertMany(expiredApplications);
      const deleteAppResult = await Application.deleteMany({
        status: 'released',
        validUntil: { $lt: today }
      });
      console.log(`[ARCHIVER] Application archiving complete. ${deleteAppResult.deletedCount} items safely moved to archive.`);
    }

  } catch (error) {
    console.error('[ARCHIVER] Severe Error running weekly archive:', error);
  }
}, {
  scheduled: true,
  timezone: "Asia/Manila"
});