const getSesClient = require("./AwsClient");


function buildRawEmail({
  from,
  to,
  subject,
  html,
  text,
  attachments = [],
  headers = {},
}) {
  const boundary = "----=_Part_" + Date.now();

  let raw = "";
  raw += `From: ${from}\n`;
  raw += `To: ${Array.isArray(to) ? to.join(", ") : to}\n`;
  raw += `Subject: ${subject}\n`;

  for (const [k, v] of Object.entries(headers)) {
    raw += `${k}: ${v}\n`;
  }

  raw += `MIME-Version: 1.0\n`;
  raw += `Content-Type: multipart/alternative; boundary="${boundary}"\n\n`;

  if (text) {
    raw += `--${boundary}\n`;
    raw += `Content-Type: text/plain; charset=UTF-8\n\n`;
    raw += `${text}\n\n`;
  }

  if (html) {
    raw += `--${boundary}\n`;
    raw += `Content-Type: text/html; charset=UTF-8\n\n`;
    raw += `${html}\n\n`;
  }

  for (const att of attachments) {
    raw += `--${boundary}\n`;
    raw += `Content-Type: ${att.contentType}; name="${att.filename}"\n`;
    raw += `Content-Disposition: attachment; filename="${att.filename}"\n`;
    raw += `Content-Transfer-Encoding: base64\n\n`;
    raw += att.content.toString("base64") + "\n\n";
  }

  raw += `--${boundary}--`;

  return Buffer.from(raw);
}

async function sendSesEmail(
  senderConfig,
  { to, subject, html, text, attachments = [], headers = {} }
) {

  const ses = getSesClient();

  try {
    let result;

    if (Object.keys(headers).length > 0 || attachments.length > 0) {
      const raw = buildRawEmail({
        from: senderConfig.fromName
          ? `${senderConfig.fromName} <${senderConfig.fromEmail}>`
          : senderConfig.fromEmail,
        to,
        subject,
        html,
        text,
        attachments,
        headers,
      });

      const command = new SendRawEmailCommand({ RawMessage: { Data: raw } });
      const res = await ses.send(command);
      result = { messageId: res.MessageId, raw: true };
    } else {
      const command = new SendEmailCommand({
        Source: senderConfig.fromEmail,
        Destination: { ToAddresses: Array.isArray(to) ? to : [to] },
        Message: {
          Subject: { Data: subject },
          Body: html
            ? { Html: { Data: html } }
            : { Text: { Data: text || "" } },
        },
      });

      const res = await ses.send(command);

      result = { messageId: res.MessageId, raw: false };
    }

    return { success: true, provider: "ses", ...result };
  } catch (err) {
    console.error("SES send error:", err);
    return {
      success: false,
      provider: "ses",
      error: err.message,
      code: err.code || "SEND_ERROR",
    };
  }
}



module.exports = { buildRawEmail, sendSesEmail };
