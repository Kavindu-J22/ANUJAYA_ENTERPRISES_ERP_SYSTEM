const cron = require('node-cron');
const { getAlertsOverview, triggerBatchAlerts } = require('./alertService');

function initCronScheduler() {
  console.log("Initializing Automated Rental Alert Scheduler (node-cron)...");

  // Run daily at 12:00 AM (Midnight) and 12:00 PM (Noon)
  cron.schedule('0 0,12 * * *', async () => {
    console.log(">>> [DAILY CRON] Executing scheduled automated rental alert check (12:00 AM / 12:00 PM)...");
    try {
      const overview = await getAlertsOverview();
      console.log(`[DAILY CRON] Active alerts found: Total ${overview.counts.total} (Overdue: ${overview.counts.overdue}, Due Today: ${overview.counts.dueToday}, 3-Day: ${overview.counts.threeDays}, 7-Day: ${overview.counts.sevenDays})`);
      
      if (overview.counts.total > 0) {
        const result = await triggerBatchAlerts();
        console.log(`[DAILY CRON] Successfully processed batch alert notifications:`, result.totalTriggered);
      } else {
        console.log(`[DAILY CRON] No urgent alert thresholds reached at this cycle.`);
      }
    } catch (err) {
      console.error("[DAILY CRON ERROR] Failed during scheduled alert scan:", err.message);
    }
  });

  console.log("Automated Scheduler running: Scheduled daily scans at 12:00 AM (Midnight) and 12:00 PM (Noon).");
}

module.exports = { initCronScheduler };
