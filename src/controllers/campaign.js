const {
  contacts,
  senders,
  campaigns,
  templates,
  Sequelize,
} = require("../models");
const {
  createEmailJobsForCampaign,
} = require("../utils/campaigns/campaignScheduler.js");
const ErrorHandler = require("../utils/global/errorHandler.js");
const { toUTCDate } = require("../utils/global/moment.js");

exports.fetchAllContacts = async (req, res) => {
  try {
    const userId = req.user.id;

    const distinctLists = await contacts.findAll({
      attributes: [
        "listName",
        [Sequelize.fn("MAX", Sequelize.col("createdAt")), "latestCreatedAt"],
      ],
      where: { isDeleted: false, userId },
      group: ["listName"],
      order: [[Sequelize.literal('"latestCreatedAt"'), "DESC"]],
    });

    res.status(200).json({
      success: true,
      message: "Distinct list names fetched successfully",
      data: distinctLists,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Error fetching distinct list names",
      error: err.message,
    });
  }
};

exports.getAllSenderAccounts = async (req, res) => {
  try {
    const userId = req.user.id;

    const allSenders = await senders.findAll({
      where: { userId },
      attributes: ["id", "fromEmail"],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      message: "Senders fetched successfully",
      data: allSenders,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching senders",
      error: err.message,
    });
  }
};

exports.getAllEmailTemplates = async (req, res) => {
  try {
    const userId = req.user.id;

    const allTemplates = await templates.findAll({
      where: { userId },
      attributes: ["id", "name"],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      message: "Templates fetched successfully",
      data: allTemplates,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching templates",
      error: err.message,
    });
  }
};

// find contact list by name
exports.launchCampaign = async (req, res) => {
  try {
    const userId = req.user.id;
    const timezone = req.user.timezone;
    const payload = req.body;

    console.log(payload);

    const contactList = await contacts.findAll({
      where: { listName: payload?.contactListName },
      attributes: ["id"],
    });

    const contactListIds = contactList.map((contact) => contact.dataValues.id);

    const campaignPayloadStructure = {
      name: payload?.name,
      senderIds: payload?.senderIds,
      templateId: payload?.templateId,
      startDate: payload?.startDate,
      totalContacts: contactListIds?.length,
      contactIds: contactListIds,
      startTime: payload?.startTime,
      status: "draft",
      timezone,
      scheduledAt: new Date(),
      userId,
    };

    const saveCamptoDb = await campaigns.create(campaignPayloadStructure);

    const jobsToInsertResult = await createEmailJobsForCampaign({
      campaign: { id: saveCamptoDb?.id, ...campaignPayloadStructure },
      userId,
    });

    console.log("jobsToInsertResult", jobsToInsertResult);

    res.status(200).json({
      success: true,
      message: "Campaign launched successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Error fetching templates",
      error: err.message,
    });
  }
};

exports.fetchAllCampaigns = async (req, res) => {
  try {
    const userId = req.user.id;

    const allCampaigns = await campaigns.findAll({
      where: { userId },
      attributes: [
        "id",
        "name",
        "status",
        "totalContacts",
        "sentCount",
        "failedCount",
        "startDate",
        "startTime",
        "scheduledAt",
        "createdAt",
        [
          Sequelize.literal(`
            CASE 
              WHEN "totalContacts" = 0 THEN 0
              ELSE ROUND((("sentCount" + "failedCount")::numeric / "totalContacts"::numeric) * 100, 2)
            END
          `),
          "progress",
        ],
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      message: "Campaigns fetched successfully",
      data: allCampaigns,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error fetching campaigns",
      error: err.message,
    });
  }
};
