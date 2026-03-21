import { Resend } from "resend";

let resend;

export const sendEmail = async ({ to, subject, html }) => {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  try {
    const response = await resend.emails.send({
      from: "onboarding@resend.dev", // IMPORTANT
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", response);
    return response;

  } catch (error) {
    console.error("❌ Email error:", error);
    throw error;
  }
};