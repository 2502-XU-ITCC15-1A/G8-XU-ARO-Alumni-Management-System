const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const STATUS_CONFIG = {
    under_review: {
        subject: 'Your Alumni ID Application is Under Review',
        heading: 'Application Under Review',
        color: '#2563eb',
        icon: '🔍',
        message: 'Your alumni ID application is currently being reviewed by our team. We will notify you once a decision has been made.'
    },
    approved: {
        subject: 'Your Alumni ID Application Has Been Approved',
        heading: 'Application Approved!',
        color: '#16a34a',
        icon: '✅',
        message: 'Congratulations! Your alumni ID application has been approved. Please proceed to the XU Book Center to complete your payment and get your ID processed.'
    },
    rejected: {
        subject: 'Update on Your Alumni ID Application',
        heading: 'Application Not Approved',
        color: '#dc2626',
        icon: '❌',
        message: 'We regret to inform you that your alumni ID application has not been approved at this time.'
    },
    payment_pending: {
        subject: 'Payment Receipt Received – Pending Verification',
        heading: 'Receipt Received',
        color: '#d97706',
        icon: '🧾',
        message: 'Your payment receipt has been received and is currently being verified by the XU Book Center. We will notify you once the verification is complete.'
    },
    printing: {
        subject: 'Your Alumni ID Card is Being Printed',
        heading: 'ID Printing in Progress',
        color: '#7c3aed',
        icon: '🖨️',
        message: 'Great news! Your alumni ID card is now being printed. You will be notified as soon as it is ready for pickup.'
    },
    released: {
        subject: 'Your Alumni ID Card is Ready for Pickup',
        heading: 'ID Card Ready for Pickup!',
        color: '#16a34a',
        icon: '🎉',
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
            <p style="margin:0;font-size:32px;">${config.icon}</p>
            <h1 style="margin:8px 0 0;color:#ffffff;font-size:20px;font-weight:700;">${config.heading}</h1>
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

const sendStatusEmail = async (toEmail, applicantName, status, remarks = '') => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('Email credentials not configured. Skipping email notification.');
        return;
    }

    const config = STATUS_CONFIG[status];
    if (!config) return;

    const html = buildEmailHtml(applicantName, status, remarks);
    if (!html) return;

    try {
        await transporter.sendMail({
            from: `"XU Alumni Management System" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: config.subject,
            html
        });
        console.log(`Email sent to ${toEmail} for status: ${status}`);
    } catch (err) {
        console.error(`Failed to send email to ${toEmail}:`, err.message);
    }
};

module.exports = { sendStatusEmail };
