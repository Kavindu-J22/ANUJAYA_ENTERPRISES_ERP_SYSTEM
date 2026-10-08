const cron = require('node-cron');
const { getAlertsOverview, triggerBatchAlerts } = require('./alertService');

function initCronScheduler() {
  console.log("Initializing Automated Rental Alert Scheduler (node-cron)...");

  // Run daily at 08:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log(">>> [DAILY CRON] Executing scheduled automated rental alert check (08:00 AM)...");
    try {
      const overview = await getAlertsOverview();
      console.log(`[DAILY CRON] Active alerts found: Total ${overview.counts.total} (Overdue: ${overview.counts.overdue}, Due Today: ${overview.counts.dueToday}, 3-Day: ${overview.counts.threeDays}, 7-Day: ${overview.counts.sevenDays})`);
      
      if (overview.counts.total > 0) {
        const result = await triggerBatchAlerts();
        console.log(`[DAILY CRON] Successfully processed batch alert notifications:`, result.totalTriggered);
      } else {
        console.log(`[DAILY CRON] No urgent alert thresholds reached today.`);
      }
    } catch (err) {
      console.error("[DAILY CRON ERROR] Failed during scheduled alert scan:", err.message);
    }
  });

  console.log("Automated Scheduler running: Scheduled daily scan at 08:00 AM.");
}

module.exports = { initCronScheduler };
