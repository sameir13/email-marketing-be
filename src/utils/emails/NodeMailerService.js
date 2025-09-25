const nodemailer = require("nodemailer");
const { senders } = require("../../models");



async function sendNodemailerEmail(emailData) {
  try {
    const {
      senderConfig,
      to,
      subject,
      html,
      text,
      attachments = [],
      replyTo,
      headers = {},
      options = {},
    } = emailData;

    const transporter = nodemailer.createTransport({
      host: senderConfig.smtpHost,
      port: Number(senderConfig.smtpPort),
      secure: Number(senderConfig.smtpPort) === 465,
      auth: {
        user: senderConfig.smtpUser,
        pass: senderConfig.smtpPass,
      },
      tls: { rejectUnauthorized: false },
      pool: options.pool || false,
      rateDelta: options.rateDelta || 5000,
      rateLimit: options.rateLimit || 1,
    });

    if (options.verify !== false) {
      await transporter.verify();
    }

    const recipients = Array.isArray(to)
      ? to.map((r) => (typeof r === "string" ? r : r.email))
      : typeof to === "string"
      ? to
      : to?.email;

    const mailOptions = {
      from: senderConfig.fromName
        ? `${senderConfig.fromName} <${senderConfig.fromEmail}>`
        : senderConfig.fromEmail,
      to: recipients,
      subject,
      text: text || undefined,
      html: html || undefined,
      replyTo: replyTo || senderConfig.fromEmail,
      attachments,
      headers: {
        "X-Provider": senderConfig.provider || "custom",
        "X-Sender-ID": senderConfig.id || "unknown",
        ...headers,
      },
    };

    const info = await transporter.sendMail(mailOptions);

    if (!options.pool) {
      transporter.close();
    }

    return {
      success: true,
      provider: senderConfig.provider || "custom",
      messageId: info.messageId,
      response: info.response,
      envelope: info.envelope,
      previewUrl: nodemailer.getTestMessageUrl(info) || null,
    };
  } catch (error) {
    console.error("Email send error:", error);
    return {
      success: false,
      provider: emailData?.senderConfig?.provider || "custom",
      error: error.message,
      code: error.code || "SEND_ERROR",
    };
  }
}

module.exports = sendNodemailerEmail;


// async function unitTestEmailSending() {
//   try {
//     const senderAccounts = await senders.findAll();

//     if (!senderAccounts || senderAccounts.length === 0) {
//       console.log("No sender accounts found!");
//       return;
//     }

//     for (const sender of senderAccounts) {
//       const senderConfig = sender.dataValues;

//       console.log(`\n=== Testing sender: ${senderConfig.fromEmail} ===`);

//       const emailData = {
//         senderConfig,
//         to: "yourtestemail@example.com", 
//         subject: `Test Email from ${senderConfig.fromEmail}`,
//         text: "This is a test email sent via Nodemailer.",
//         html: `<p><b>This is a test email</b> from <i>${senderConfig.fromEmail}</i></p>`,
//         options: { verify: false }, 
//       };

//       const result = await sendNodemailerEmail(emailData);
//       console.log("Result:", result);
//     }
//   } catch (error) {
//     console.error("Error in unitTestEmailSending:", error);
//   }
// }


// (async () => {
//   await unitTestEmailSending(senders);
// })();
