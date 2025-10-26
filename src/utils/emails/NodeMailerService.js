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

    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: senderConfig.smtpHost,
      port: Number(senderConfig.smtpPort),
      secure: Number(senderConfig.smtpPort) === 465,
      auth: {
        user: testAccount?.user,
        pass: testAccount?.pass,
      },
      tls: { rejectUnauthorized: false },
      pool: options.pool || false,
      rateDelta: options.rateDelta || 5000,
      rateLimit: options.rateLimit || 1,
    });

    if (options.verify !== false) {
      await transporter.verify();
    }


    const mailOptions = {
      from: senderConfig.fromName
        ? `${senderConfig.fromName} <${senderConfig.fromEmail}>`
        : senderConfig.fromEmail,
      to: to,
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
