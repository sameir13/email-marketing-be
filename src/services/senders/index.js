const express = require("express");
const router = express.Router();
const { addSender } = require("../../controllers/senders");
const authorize = require("../../middleware/Authorisation");

router.post("/", authorize, addSender); 

module.exports = router;
