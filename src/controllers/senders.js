const bcrypt = require("bcryptjs");
const { senders } = require("../models"); 
const ErrorHandler = require("../utils/global/errorHandler.js");

exports.addSender = async (req, res, next) => {
  try {
    const userId = req.user.id; 
    
    const {
      provider,
      fromName,
      fromEmail,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      region,
      isDefault,
      rateLimit
    } = req.body;

    if (!provider || !fromEmail) {
      return next(new ErrorHandler("Provider and fromEmail are required!", 400));
    }

    if (!["ses", "gmail", "testing"].includes(provider)) {
      return next(new ErrorHandler("Invalid provider. Must be 'ses', 'gmail', or 'testing'", 400));
    }

    const existingSender = await senders.findOne({
      where: {
        userId,
        fromEmail
      }
    });

    if (existingSender) {
      return next(new ErrorHandler("Sender with this email already exists!", 400));
    }

    let hashedSmtpPass = null;
    if (smtpPass) {
      hashedSmtpPass = smtpPass
    }

    if (isDefault) {
      await senders.update(
        { isDefault: false },
        { where: { userId } }
      );
    }


    const newSender = await senders.create({
      userId,
      provider,
      fromName: fromName || null,
      fromEmail,
      smtpHost: smtpHost || null,
      smtpPort: smtpPort || null,
      smtpUser: smtpUser || null,
      smtpPass: hashedSmtpPass,
      region: region || null,
      isDefault: isDefault || false,
      rateLimit: rateLimit || null,
      status:"verified"
    });


    res.status(201).json({
      success: true,
      message: "Sender account added successfully!",
      sender: newSender
    });

  } catch (error) {
    console.error("Error adding sender:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

exports.getAllSenders = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const userSenders = await senders.findAll({
      where: { userId },
      attributes: { exclude: ["smtpPass"] }, // Exclude sensitive data
      order: [["createdAt", "DESC"]]
    });

    res.status(200).json({
      success: true,
      message: "Senders retrieved successfully",
      senders: userSenders,
      count: userSenders.length
    });

  } catch (error) {
    console.error("Error fetching senders:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

exports.getSenderById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { senderId } = req.params;

    const sender = await senders.findOne({
      where: {
        id: senderId,
        userId
      },
      attributes: { exclude: ["smtpPass"] }
    });

    if (!sender) {
      return next(new ErrorHandler("Sender not found", 404));
    }

    res.status(200).json({
      success: true,
      sender
    });

  } catch (error) {
    console.error("Error fetching sender:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

exports.updateSender = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { senderId } = req.params;
    
    const {
      provider,
      fromName,
      fromEmail,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      region,
      isDefault,
      rateLimit,
      status
    } = req.body;

    // Find sender
    const sender = await senders.findOne({
      where: {
        id: senderId,
        userId
      }
    });

    if (!sender) {
      return next(new ErrorHandler("Sender not found", 404));
    }

    // Validate provider if provided
    if (provider && !["ses", "gmail", "testing"].includes(provider)) {
      return next(new ErrorHandler("Invalid provider. Must be 'ses', 'gmail', or 'testing'", 400));
    }

    // Check if email is being changed and if it conflicts
    if (fromEmail && fromEmail !== sender.fromEmail) {
      const existingSender = await senders.findOne({
        where: {
          userId,
          fromEmail,
          id: { [require('sequelize').Op.ne]: senderId }
        }
      });

      if (existingSender) {
        return next(new ErrorHandler("Another sender with this email already exists!", 400));
      }
    }

    // Prepare update data
    const updateData = {};
    
    if (provider !== undefined) updateData.provider = provider;
    if (fromName !== undefined) updateData.fromName = fromName;
    if (fromEmail !== undefined) updateData.fromEmail = fromEmail;
    if (smtpHost !== undefined) updateData.smtpHost = smtpHost;
    if (smtpPort !== undefined) updateData.smtpPort = smtpPort;
    if (smtpUser !== undefined) updateData.smtpUser = smtpUser;
    if (region !== undefined) updateData.region = region;
    if (rateLimit !== undefined) updateData.rateLimit = rateLimit;
    if (status !== undefined) updateData.status = status;

    // Hash password if provided
    if (smtpPass) {
      updateData.smtpPass = await bcrypt.hash(smtpPass, 12);
    }

    // Handle default sender logic
    if (isDefault === true) {
      // Make all other senders non-default
      await senders.update(
        { isDefault: false },
        { where: { userId } }
      );
      updateData.isDefault = true;
    } else if (isDefault === false) {
      updateData.isDefault = false;
    }

    // Update sender
    await sender.update(updateData);

    // Fetch updated sender without sensitive data
    const updatedSender = await senders.findOne({
      where: {
        id: senderId,
        userId
      },
      attributes: { exclude: ["smtpPass"] }
    });

    res.status(200).json({
      success: true,
      message: "Sender updated successfully!",
      sender: updatedSender
    });

  } catch (error) {
    console.error("Error updating sender:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

exports.deleteSender = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { senderId } = req.params;

    const sender = await senders.findOne({
      where: {
        id: senderId,
        userId
      }
    });

    if (!sender) {
      return next(new ErrorHandler("Sender not found", 404));
    }

    await sender.destroy();

    res.status(200).json({
      success: true,
      message: "Sender deleted successfully!"
    });

  } catch (error) {
    console.error("Error deleting sender:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

exports.setDefaultSender = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { senderId } = req.params;

    // Check if sender exists and belongs to user
    const sender = await senders.findOne({
      where: {
        id: senderId,
        userId
      }
    });

    if (!sender) {
      return next(new ErrorHandler("Sender not found", 404));
    }

    // Make all senders non-default
    await senders.update(
      { isDefault: false },
      { where: { userId } }
    );

    // Set this sender as default
    await sender.update({ isDefault: true });

    res.status(200).json({
      success: true,
      message: "Default sender updated successfully!"
    });

  } catch (error) {
    console.error("Error setting default sender:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};