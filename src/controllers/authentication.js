const bcrypt = require("bcryptjs");
const {users} = require("../models")
const { generateToken } = require("../utils/generateToken.js");
const ErrorHandler = require("../utils/global/errorHandler.js");




exports.registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;


    const existingUser = await users.findOne({ where: { email } });

    if (existingUser) {
      return next(new ErrorHandler("Account already exists!", 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const registerNewUser = await users.create({
      email,
      password: hashedPassword,
    });

    const userPayload = {
      ...registerNewUser?.dataValues,
    };


    const token = generateToken(userPayload);


    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      token,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await users.findOne({ where: { email } });

    if (!user) {
      return next(new ErrorHandler("Invalid email or password", 400));
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return next(new ErrorHandler("Incorrect password!", 400));
    }

    var userPayload = {
      ...user?.dataValues,
    };

    const token = generateToken(userPayload);

    await user.update({ last_login: new Date() });

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.updateCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { email, ...otherFields } = req.body;

    const user = await users.findByPk(userId);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const updateData = { ...otherFields };

    if (email && email !== user.email) {
      const existingUser = await users.findOne({
        where: { email },
        raw: true,
      });

      if (existingUser && existingUser.id !== userId) {
        return next(new ErrorHandler("Email already exists!", 400));
      }

      updateData.email = email;
    }

    await user.update(updateData);

    const updatedUser = await users.findByPk(userId);

    const userPayload = {
      ...updatedUser?.dataValues,
    };

    delete userPayload.password;

    console.log("updatedCurrentUser --", userPayload);

    const token = generateToken(userPayload);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      user: userPayload,
      token,
    });
  } catch (error) {
    console.error("Error updating current user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await users.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

