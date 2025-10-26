const express = require("express");
const router = express.Router();
const authorize = require("../../middleware/Authorisation");
const {
  createTemplate,
  getAllTemplates,
  getTemplateById,
} = require("../../controllers/template");

router.post("/", authorize, createTemplate);
router.get("/all", authorize, getAllTemplates);
router.get("/:id", authorize, getTemplateById);

module.exports = router;
