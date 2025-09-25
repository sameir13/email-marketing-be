const sendNodemailerEmail = require("../utils/sendNodemailerEmail");
const { sendSesEmail } = require("./AwsSmtpService");

class EmailService {
  static async sendEmail(senderConfig, options) {
    try {
      let result;

      switch (senderConfig.provider) {
        case "testing":
          result = await sendNodemailerEmail({
            senderConfig,
            ...options,
          });
          break;

        case "ses":
          sendSesEmail(senderConfig, emailData);
          break;

        default:
          throw new Error(`Unsupported provider: ${senderConfig.provider}`);
      }

      return { success: true, provider: senderConfig.provider, ...result };
    } catch (err) {
      return {
        success: false,
        provider: senderConfig?.provider || "unknown",
        error: err.message,
        code: err.code || "SEND_ERROR",
      };
    }
  }
}

module.exports = EmailService;
