import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',  // use gmail service directly instead of host/port
    auth: {
      user: process.env.EMAIL_USER,
      pass: (process.env.EMAIL_PASS || '').replace(/\s/g, ''),
    },
  });

  const info = await transporter.sendMail({
    from:    `"Miskara Jewellery" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });

  console.log(`📧 Email sent → ${to} | ID: ${info.messageId}`);
  return info;
};