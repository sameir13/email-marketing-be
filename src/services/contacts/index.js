const express = require("express");
const router = express.Router();
const authorize = require("../../middleware/Authorisation");
const { createTag, deleteTag, getAllTags, addContacts, getContacts } = require("../../controllers/contacts");

router.post("/tags", authorize, createTag);
router.delete("/:id/tags", authorize, deleteTag);
router.get("/all/tags", authorize, getAllTags);

// contacts
router.post("/add", authorize, addContacts);
router.get("/all", authorize, getContacts);


module.exports = router;
