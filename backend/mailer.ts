
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

interface PickupDetails {
  status: string;
  wasteType: string;
  scheduledDate: string | Date;
  location: string;
}

export const sendPickupNotification = async (email: string, name: string, details: PickupDetails) => {
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

export const sendVerificationEmail = async (email: string, name: string, token: string) => {
  const verificationLink = `http://localhost:5000/api/users/verify?token=${token}`;
  const mailOptions = {
    from: `"Waste Up Ibadan" <${SYSTEM_EMAIL}>`,
    to: email,
    subject: 'Verify Your Email for Waste Up',
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
        <h2 style="color: #10b981;">🌱 Welcome to Waste Up Ibadan</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Thank you for registering. Please click the link below to verify your email address:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${verificationLink}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Verify Email</a>
        </div>
        <p>If you did not create an account, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b;">This is an automated message from the Oyo State Waste Management Authority pilot system.</p>
      </div>
    `,
  };

  try {
    if (EMAIL_PASS === 'mock_password') {
      console.log(`[MAILER MOCK] Sending verification email to ${email} with link: ${verificationLink}`);
      return;
    }
    await transporter.sendMail(mailOptions);
    console.log(`[MAILER] Verification email sent to ${email}`);
  } catch (error) {
    console.error('[MAILER ERROR]', error);
  }
};