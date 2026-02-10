
// backend/mailer.ts
import nodemailer from 'nodemailer';

const SYSTEM_EMAIL = "simeonkenny66@gmail.com";
// In a real app, EMAIL_PASS would be a Google App Password
const EMAIL_PASS = process.env.EMAIL_PASS || 'mock_password'; 

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: SYSTEM_EMAIL,
    pass: EMAIL_PASS,
  },
});

export const sendPickupNotification = async (email: string, name: string, details: any) => {
  const mailOptions = {
    from: `"Waste Up Ibadan" <${SYSTEM_EMAIL}>`,
    to: email,
    subject: `Waste Pickup Update: ${details.status}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
        <h2 style="color: #10b981;">🌱 Waste Up Ibadan</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>There is an update on your waste pickup request:</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Status:</strong> <span style="text-transform: uppercase; font-weight: bold; color: #10b981;">${details.status}</span></p>
          <p><strong>Waste Type:</strong> ${details.wasteType}</p>
          <p><strong>Scheduled Date:</strong> ${new Date(details.scheduledDate).toLocaleDateString()}</p>
          <p><strong>Location:</strong> ${details.location}</p>
        </div>
        <p>Thank you for helping us keep Ibadan clean and flood-free!</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b;">This is an automated message from the Oyo State Waste Management Authority pilot system.</p>
      </div>
    `,
  };

  try {
    // In demo mode, we just log instead of actually attempting a send if credentials aren't set
    if (EMAIL_PASS === 'mock_password') {
      console.log(`[MAILER MOCK] Sending email to ${email} regarding status ${details.status}`);
      return;
    }
    await transporter.sendMail(mailOptions);
    console.log(`[MAILER] Notification sent to ${email}`);
  } catch (error) {
    console.error('[MAILER ERROR]', error);
  }
};
