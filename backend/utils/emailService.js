const { google } = require('googleapis');

const STATUS_CONFIG = {
    under_review: {
        subject: 'Your Alumni ID Application is Under Review',
        heading: 'Application Under Review',
        color: '#2563eb',
        icon: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="7" stroke="white" stroke-width="2"/><path d="M16.5 16.5L21 21" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>',
        message: 'Your alumni ID application is currently being reviewed by our team. We will notify you once a decision has been made.'
    },
    approved: {
        subject: 'Your Alumni ID Application Has Been Approved',
        heading: 'Application Approved!',
        color: '#16a34a',
        icon: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/><path d="M7 12l3.5 3.5L17 9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        message: 'Congratulations! Your alumni ID application has been approved by the Alumni Relations Office.<br><br>' +
                 'To proceed with your Alumni ID card, please follow these steps:<br><br>' +
                 '<strong>1.</strong> Visit the <strong>XU Book Center</strong> in person.<br>' +
                 '<strong>2.</strong> Present this email or your name and University ID number to the Book Center staff.<br>' +
                 '<strong>3.</strong> Pay the Alumni ID fee of <strong>₱150.00</strong>.<br>' +
                 '<strong>4.</strong> The Book Center staff will process and print your Alumni ID card upon payment.<br><br>' +
                 'Please note that ID printing will only proceed once payment has been confirmed by the Book Center.'
    },
    rejected: {
        subject: 'Update on Your Alumni ID Application',
        heading: 'Application Not Approved',
        color: '#dc2626',
        icon: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/><path d="M9 9l6 6M15 9l-6 6" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>',
        message: 'We regret to inform you that your alumni ID application has not been approved at this time.'
    },
    payment_pending: {
        subject: 'Payment Confirmed – Your Alumni ID is Being Processed',
        heading: 'Payment Confirmed',
        color: '#d97706',
        icon: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="18" height="14" rx="2" stroke="white" stroke-width="2"/><path d="M3 9h18" stroke="white" stroke-width="2"/><path d="M7 14h4" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>',
        message: 'Your payment has been received and confirmed by the XU Book Center. Your Alumni ID card is now being processed for printing. We will notify you once it is ready for pick-up.'
    },
    printing: {
        subject: 'Your Alumni ID Card is Being Printed',
        heading: 'ID Printing in Progress',
        color: '#7c3aed',
        icon: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9V4h12v5" stroke="white" stroke-width="2" stroke-linejoin="round"/><rect x="3" y="9" width="18" height="8" rx="1" stroke="white" stroke-width="2"/><path d="M6 14h12v6H6z" stroke="white" stroke-width="2" stroke-linejoin="round"/><circle cx="17" cy="13" r="1" fill="white"/></svg>',
        message: 'Great news! Your alumni ID card is now being printed. You will be notified as soon as it is ready for pickup.'
    },
    released: {
        subject: 'Your Alumni ID Card is Ready for Pickup',
        heading: 'ID Card Ready for Pickup!',
        color: '#16a34a',
        icon: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="9" r="5" stroke="white" stroke-width="2"/><path d="M8.5 14.5L7 21l5-2.5L17 21l-1.5-6.5" stroke="white" stroke-width="2" stroke-linejoin="round"/><path d="M9.5 9l2 2 3.5-3.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        message: 'Your alumni ID card is ready! Please visit the XU Alumni Relations Office to claim it. Bring a valid government-issued ID when picking up your card.'
    }
};

const buildEmailHtml = (applicantName, status, remarks) => {
    const config = STATUS_CONFIG[status];
    if (!config) return null;

    const remarksSection = (status === 'rejected' && remarks)
        ? `<div style="background:#fef2f2;border-left:4px solid #dc2626;padding:12px 16px;margin:16px 0;border-radius:4px;">
               <p style="margin:0;font-size:14px;color:#7f1d1d;"><strong>Reason:</strong> ${remarks}</p>
           </div>`
        : (remarks ? `<div style="background:#f0f9ff;border-left:4px solid #2563eb;padding:12px 16px;margin:16px 0;border-radius:4px;">
               <p style="margin:0;font-size:14px;color:#1e3a5f;"><strong>Note:</strong> ${remarks}</p>
           </div>` : '');

    return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:${config.color};padding:28px 32px;text-align:center;">
            <div style="margin:0 auto 8px;display:inline-block;">${config.icon}</div>
            <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">${config.heading}</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 16px;font-size:15px;color:#374151;">Dear <strong>${applicantName}</strong>,</p>
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">${config.message}</p>
            ${remarksSection}
            <p style="margin:16px 0 0;font-size:15px;color:#374151;line-height:1.6;">
              If you have any questions or concerns, please don't hesitate to contact us at the Alumni Relations Office.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 32px;text-align:center;">
            <p style="margin:0;font-size:13px;color:#6b7280;font-weight:600;">Xavier University – Alumni Relations Office (ARO)</p>
            <p style="margin:4px 0 0;font-size:12px;color:#9ca3af;">This is an automated message. Please do not reply directly to this email.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
};

const createGmailClient = () => {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GMAIL_CLIENT_ID,
        process.env.GMAIL_CLIENT_SECRET,
        'https://developers.google.com/oauthplayground'
    );
    oauth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
    return google.gmail({ version: 'v1', auth: oauth2Client });
};

const sendStatusEmail = async (toEmail, applicantName, status, remarks = '') => {
    if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET || !process.env.GMAIL_REFRESH_TOKEN) {
        console.warn('Gmail API credentials not configured. Skipping email notification.');
        return;
    }

    const config = STATUS_CONFIG[status];
    if (!config) return;

    const html = buildEmailHtml(applicantName, status, remarks);
    if (!html) return;

    const rawMessage = [
        `From: "XU Alumni Management System" <${process.env.EMAIL_USER}>`,
        `To: ${toEmail}`,
        `Subject: ${config.subject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        '',
        html
    ].join('\n');

    const encodedMessage = Buffer.from(rawMessage).toString('base64url');

    try {
        const gmail = createGmailClient();
        await gmail.users.messages.send({
            userId: 'me',
            requestBody: { raw: encodedMessage }
        });
        console.log(`Email sent to ${toEmail} for status: ${status}`);
    } catch (err) {
        console.error(`Failed to send email to ${toEmail}:`, err.message);
    }
};

module.exports = { sendStatusEmail };
