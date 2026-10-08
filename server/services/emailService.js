const nodemailer = require('nodemailer');

const SENDER_EMAIL = 'anujayaenterprises.info@gmail.com';
const SENDER_PASS = 'cwck ptjr vfps cmkr'.replace(/\s+/g, '');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: SENDER_EMAIL,
    pass: SENDER_PASS
  }
});

function getAlertBadge(alertType, daysDiff) {
  switch (alertType) {
    case '7_DAYS':
      return {
        title: 'UPCOMING PAYMENT NOTICE (7 DAYS REMAINING)',
        bgColor: '#fef3c7',
        borderColor: '#f59e0b',
        textColor: '#b45309',
        icon: '⚠️',
        desc: `Rental payment cycle deadline is in ${daysDiff} days.`
      };
    case '3_DAYS':
      return {
        title: 'URGENT PAYMENT REMINDER (3 DAYS REMAINING)',
        bgColor: '#ffedd5',
        borderColor: '#f97316',
        textColor: '#c2410c',
        icon: '⏳',
        desc: `Rental payment deadline is approaching within ${daysDiff} days.`
      };
    case 'DUE_TODAY':
      return {
        title: 'PAYMENT DUE TODAY - OFFICIAL SETTLEMENT NOTICE',
        bgColor: '#fee2e2',
        borderColor: '#ef4444',
        textColor: '#b91c1c',
        icon: '🔔',
        desc: 'Today is the scheduled payment due date for your machinery rental fleet.'
      };
    case 'OVERDUE':
      return {
        title: `CRITICAL OVERDUE ALERT (${Math.abs(daysDiff)} DAYS PAST DUE)`,
        bgColor: '#fdf2f8',
        borderColor: '#ec4899',
        textColor: '#be185d',
        icon: '🚨',
        desc: `Payment settlement is currently overdue by ${Math.abs(daysDiff)} days.`
      };
    default:
      return {
        title: 'MACHINERY HIRE PAYMENT NOTICE',
        bgColor: '#e0f2fe',
        borderColor: '#0284c7',
        textColor: '#0369a1',
        icon: '📋',
        desc: 'Official rental fleet accounting statement.'
      };
  }
}

async function sendRentalDueAlertEmail({ customer, alertType, daysDiff, dueDate, amountDue, activeRentals, bankInfo }) {
  const badge = getAlertBadge(alertType, daysDiff);
  const recipient = customer.email && customer.email.includes('@') ? customer.email : SENDER_EMAIL;
  const isDirectClient = recipient !== SENDER_EMAIL;

  const rentalsListHtml = (activeRentals || []).map(r => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 10px 12px; font-weight: 600; color: #1e293b;">${r.model || 'Industrial Sewing Machine'}</td>
      <td style="padding: 10px 12px; font-family: monospace; color: #475569;">${r.serialNumber || 'Yard Tracked'}</td>
      <td style="padding: 10px 12px; text-align: right; font-weight: bold; font-family: monospace; color: #0f172a;">Rs. ${Number(r.rentRate || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
    </tr>
  `).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${badge.title}</title>
    </head>
    <body style="margin: 0; padding: 24px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; color: #0f172a;">
      <div style="max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0a0f1d 0%, #1e293b 100%); padding: 30px 32px; color: #ffffff;">
          <div style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #38bdf8; font-weight: 800; margin-bottom: 4px;">
            Anujaya Enterprises & Global Consortium
          </div>
          <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">
            Industrial Sewing Machinery ERP
          </h1>
          <p style="margin: 6px 0 0 0; font-size: 12px; color: #94a3b8;">
            Central Fleet Yard: 200/2B/1, Pahala Kosgama, Kosgama, Sri Lanka • Hotline: 077 412 7702
          </p>
        </div>

        <!-- Alert Notification Box -->
        <div style="padding: 24px 32px;">
          <div style="background-color: ${badge.bgColor}; border-left: 5px solid ${badge.borderColor}; padding: 18px 20px; border-radius: 8px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 20px;">${badge.icon}</span>
              <strong style="color: ${badge.textColor}; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">${badge.title}</strong>
            </div>
            <p style="margin: 8px 0 0 0; font-size: 13px; color: #334155;">
              ${badge.desc}
            </p>
          </div>

          <!-- Customer & Due Date Summary -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; background: #f8fafc; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0;">
            <tr>
              <td style="padding: 12px 16px; font-size: 12px; color: #64748b; width: 35%;">Client Name:</td>
              <td style="padding: 12px 16px; font-size: 14px; font-weight: bold; color: #0f172a;">${customer.name} (${customer.code})</td>
            </tr>
            <tr style="border-top: 1px solid #e2e8f0;">
              <td style="padding: 12px 16px; font-size: 12px; color: #64748b;">Phone / Contact:</td>
              <td style="padding: 12px 16px; font-size: 13px; color: #1e293b;">${customer.phone || 'N/A'}</td>
            </tr>
            <tr style="border-top: 1px solid #e2e8f0;">
              <td style="padding: 12px 16px; font-size: 12px; color: #64748b;">Scheduled Due Date:</td>
              <td style="padding: 12px 16px; font-size: 14px; font-weight: bold; color: #0284c7; font-family: monospace;">${dueDate}</td>
            </tr>
            <tr style="border-top: 1px solid #e2e8f0; background: #f1f5f9;">
              <td style="padding: 14px 16px; font-size: 13px; font-weight: bold; color: #334155;">Total Outstanding Balance:</td>
              <td style="padding: 14px 16px; font-size: 20px; font-weight: 900; color: #059669; font-family: monospace;">Rs. ${Number(amountDue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            </tr>
          </table>

          <!-- Active Fleet Overview -->
          <h3 style="font-size: 14px; color: #0f172a; margin: 0 0 12px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
            Active Machinery Fleet Summary
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 28px;">
            <thead>
              <tr style="background: #f1f5f9; text-align: left; color: #475569;">
                <th style="padding: 8px 12px;">Machine Description</th>
                <th style="padding: 8px 12px;">Serial Number</th>
                <th style="padding: 8px 12px; text-align: right;">Monthly Rate</th>
              </tr>
            </thead>
            <tbody>
              ${rentalsListHtml}
            </tbody>
          </table>

          <!-- Official Bank Settlement Details -->
          <div style="background: #eff6ff; border: 1px dashed #3b82f6; border-radius: 12px; padding: 20px 22px; margin-bottom: 24px;">
            <div style="font-size: 12px; font-weight: 800; color: #1e40af; text-transform: uppercase; margin-bottom: 8px;">
              🏦 Official Bank Settlement Details
            </div>
            <table style="width: 100%; font-size: 12px; color: #1e3a8a;">
              <tr>
                <td style="padding: 4px 0; width: 40%;">Bank:</td>
                <td style="padding: 4px 0; font-weight: bold;">${(bankInfo && bankInfo.bankNameEn) || 'Bank Of Ceylon'}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0;">Account Name:</td>
                <td style="padding: 4px 0; font-weight: bold;">${(bankInfo && bankInfo.accountName) || 'Anujaya Enterprises'}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0;">Account Number:</td>
                <td style="padding: 4px 0; font-weight: 800; font-family: monospace; font-size: 14px; color: #1d4ed8;">${(bankInfo && bankInfo.accountNo) || '94459826'}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0;">Branch:</td>
                <td style="padding: 4px 0; font-weight: bold;">${(bankInfo && bankInfo.branchEn) || 'Ruwanwella Branch'}</td>
              </tr>
            </table>
            <div style="margin-top: 10px; font-size: 11px; color: #3b82f6;">
              * Please forward bank deposit receipt / transfer confirmation via WhatsApp to 077 412 7702 or email to anujayaenterprises.info@gmail.com
            </div>
          </div>

          <!-- Footer Notice -->
          <p style="font-size: 11px; color: #64748b; line-height: 1.6; margin: 0;">
            This is an automated operational notice generated by the <strong>Anujaya Enterprises & Global Consortium ERP System</strong>. For technical support, looper adjustments, or fleet inquiries, please contact our 24/7 mechanical yard support.
          </p>
        </div>

        <div style="background: #f8fafc; padding: 16px 32px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center;">
          © ${new Date().getFullYear()} Anujaya Enterprises (Kosgama Yard) & Global Enterprises. All Rights Reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Anujaya Enterprises ERP" <${SENDER_EMAIL}>`,
    to: recipient,
    cc: isDirectClient ? SENDER_EMAIL : undefined,
    subject: `[${badge.title}] ${customer.name} - Anujaya Enterprises Machinery Rental ERP`,
    html: htmlContent
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Alert email sent to ${recipient} for ${customer.name}:`, info.messageId);
    return { success: true, messageId: info.messageId, recipient };
  } catch (err) {
    console.error(`Failed to send email to ${recipient}:`, err.message);
    return { success: false, error: err.message, recipient };
  }
}

module.exports = {
  sendRentalDueAlertEmail,
  transporter
};
