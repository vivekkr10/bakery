const nodemailer = require("nodemailer");

const sendContactMail = async ({ name, email, message }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Bakery Website" <${process.env.FROM_EMAIL}>`,
      to: process.env.FROM_EMAIL,
      subject: "📩 New Contact Message",
      html: `
        <div style="font-family:Arial; padding:20px;">
          <h2>New Contact Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p style="background:#f5f5f5;padding:10px;border-radius:6px;">
            ${message}
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Contact email sent");
  } catch (err) {
    console.error("❌ Contact Mail Error:", err);
    throw err;
  }
};

module.exports = sendContactMail;
