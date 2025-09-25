const jwt = require("jsonwebtoken");
const { users } = require("../models");
const ErrorHandler = require("../utils/global/errorHandler");

const authorize = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ErrorHandler("Invalid bearer token!", 400));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await users.findOne({
      where: {
        id: decoded?.id,
      },
    });

    if (!user) {
      return next(new ErrorHandler("UnAuthorized!", 400));
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = authorize;
