// services/campaignScheduler.js

const { contacts, senders, templates, email_jobs } = require("../../models");

async function createEmailJobsForCampaign({ campaign, userId }) {
  // 1. Fetch all contacts and senders once

  const { v4: uuidv4 } = await import("uuid");

  const [allContacts, allSenders] = await Promise.all([
    contacts.findAll({
      where: { id: campaign.contactIds, isDeleted: false },
      raw: true,
    }),
    senders.findAll({
      where: { id: campaign.senderIds, userId },
      raw: true,
    }),
  ]);

  if (!allContacts.length || !allSenders.length)
    throw new Error("No valid contacts or senders found");

  // 2. Prepare sender usage tracking
  const senderUsage = {};
  const senderRateMap = {};
  allSenders.forEach((s) => {
    senderUsage[s.id] = 0;
    senderRateMap[s.id] = s.rateLimit || 14;
  });

  // 3. Round robin + rate-aware assignment
  const assignments = [];
  let senderIndex = 0;
  const senderCount = allSenders.length;

  for (const contact of allContacts) {
    const sender = allSenders[senderIndex];
    assignments.push({
      contact,
      sender,
    });

    senderUsage[sender.id] += 1;
    senderIndex = (senderIndex + 1) % senderCount;
  }

  const senderNextTime = {};
  const jobsToInsert = [];

  const foundTemplateForCamp = await templates.findOne({
    where: {
      id: campaign?.templateId,
    },
  });

  

  for (const { contact, sender } of assignments) {
    const rate = senderRateMap[sender.id];
    const delay = Math.ceil(1000 / rate);
    const last = senderNextTime[sender.id] || 0;
    const nextDelay = last + delay;
    senderNextTime[sender.id] = nextDelay;

    jobsToInsert.push({
      id: uuidv4(),
      userId,
      campaignId: campaign?.id,
      contactId: contact?.id,
      senderId: sender?.id,
      contactEmail: contact?.email,
      contactFirstName: contact?.firstName,
      contactLastName: contact?.lastName,
      contactMetadata: contact?.metadata,
      senderEmail: sender?.fromEmail,
      senderName: sender?.fromName,
      subject: campaign?.subject ?? "",
      senderSmtpHost:sender?.smtpHost,
      senderSmtpPass:sender?.smtpPass,
      senderSmtpPort:sender?.smtpPort,
      htmlContent: foundTemplateForCamp?.htmlContent ?? "",
      status: "PENDING",
      scheduledFor: new Date(Date.now() + nextDelay),
    });
  }

  await email_jobs.bulkCreate(jobsToInsert);


  return { created: jobsToInsert.length };
}

module.exports = { createEmailJobsForCampaign };
