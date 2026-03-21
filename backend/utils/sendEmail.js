import { Resend } from 'resend';

export const sendEmail = async ({ to, subject, html }) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from:    'Miskara Jewellery <info@miskara.co>',
      to,
      subject,
      html,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      throw new Error(error.message);
    }

    console.log('📧 Email sent to', to, '| ID:', data.id);
    return data;
  } catch (err) {
    console.error('❌ Email failed:', err.message);
    throw err;
  }
};
