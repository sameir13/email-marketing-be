const express = require("express");
const router = express.Router();
const authorize = require("../../middleware/Authorisation");
const { fetchAllContacts, getAllSenderAccounts, getAllEmailTemplates, launchCampaign, fetchAllCampaigns } = require("../../controllers/campaign");

router.get("/listNames", authorize, fetchAllContacts);

router.get("/sendersNames", authorize, getAllSenderAccounts);
router.get("/templates", authorize, getAllEmailTemplates);

// campaign service routes ---
router.post("/launch", authorize, launchCampaign);
router.get("/get/all", authorize, fetchAllCampaigns);



module.exports = router;
        