const express = require("express");

const { registerUser, loginUser, updateCurrentUser, getCurrentUser } = require("../../controllers/authentication");
const authorize = require("../../middleware/Authorisation");
const router = express.Router();

router.post("/sign-up", registerUser);
router.post("/sign-in", loginUser);
router.put("/update", authorize, updateCurrentUser);
router.get("/profile", authorize, getCurrentUser);

module.exports = router;
