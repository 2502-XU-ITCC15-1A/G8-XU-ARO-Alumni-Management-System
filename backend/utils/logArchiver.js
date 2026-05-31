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

    let logsArchivedCount = 0;
    let appsArchivedCount = 0;

    if (oldLogs.length > 0) {
      console.log(`[ARCHIVER] Sunday cleanup triggered. Found ${oldLogs.length} logs older than 30 days. Archiving...`);
      await ArchivedLog.insertMany(oldLogs);
      const deleteLogsResult = await SystemLog.deleteMany({ createdAt: { $lt: logCutoff } });
      logsArchivedCount = deleteLogsResult.deletedCount;
      console.log(`[ARCHIVER] Weekly backup complete. ${logsArchivedCount} items safely moved to cold storage.`);
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
      appsArchivedCount = deleteAppResult.deletedCount;
      console.log(`[ARCHIVER] Application archiving complete. ${appsArchivedCount} items safely moved to archive.`);
    }

    if (logsArchivedCount > 0 || appsArchivedCount > 0) {
      await SystemLog.create({
        action: "DATA_ARCHIVED",
        performedBy: {
          userId: null,
          name: "Log Archiver Engine",
          role: "system"
        },
        target: `archive-cycle-${today.toISOString().split('T')[0]}`,
        details: `Automated cleanup successful. Moved ${logsArchivedCount} historical system logs (>30 days old) and ${appsArchivedCount} expired validation profiles into secure database cold storage.`
      });
    }

  } catch (error) {
    console.error('[ARCHIVER] Severe Error running weekly archive:', error);

    try {
      await SystemLog.create({
        action: "DATA_ARCHIVE_FAILED",
        performedBy: {
          userId: null,
          name: "Log Archiver Engine",
          role: "system"
        },
        target: "CRON_WEEKLY_CLEANUP",
        details: `System sweeping process collapsed: ${error.message}`
      });
    } catch (logErr) {
      console.error('[ARCHIVER] Failed to log failure exception to database:', logErr.message);
    }
  }
}, {
  scheduled: true,
  timezone: "Asia/Manila"
});