const AuthenticationRoutes = require("./authentication/index");
const SenderRoutes = require("./senders/index");
const ContactRoutes = require("./contacts/index");
const TemplateRoutes = require("./templates/index");
const CampaignRoutes = require("./campaigns/index");

function AppConfig(app) {
  app.use("/api/auth", AuthenticationRoutes);
  app.use("/api/senders", SenderRoutes);
  app.use("/api/contacts", ContactRoutes);
  app.use("/api/templates", TemplateRoutes);
  app.use("/api/campaigns", CampaignRoutes);
}

module.exports = AppConfig;
