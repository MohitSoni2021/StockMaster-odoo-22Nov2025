import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_PASSWORD,
  },
});

export const sendEmail = async (
  receiverEmail,
  html,
  body,
  subject,
  organizationName
) => {
  try {
    const mailOptions = {
      from: `${organizationName} <${process.env.SENDER_EMAIL}>`,
      to: receiverEmail,
      subject: subject,
      text: body,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    return {
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to send email',
      error: error.message,
    };
  }
};
