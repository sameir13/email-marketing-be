const { templates } = require("../models");
const ErrorHandler = require("../utils/global/errorHandler.js");
const response = require("../utils/global/response.js");

exports.createTemplate = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, htmlContent, designJson, type } = req.body;

    const exists = await templates.findOne({ where: { name, userId } });

    if (exists)
      return next(new ErrorHandler("Template name already exists", 400));

    const payload = { userId, name, htmlContent, designJson, type };

    const template = await templates.create({
      ...payload,
    });

    res.status(201).json({
      success: true,
      message: "Template created successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllTemplates = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const allTemplates = await templates.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      message: "Template fetched successfully",
      data: allTemplates,
    });
  } catch (err) {
    next(err);
  }
};

exports.getTemplateById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const template = await templates.findOne({
      where: { id, userId },
      attributes: ["designJson"],
    });

    res.status(200).json({
      success: true,
      message: "Template fetched successfully",
      data: template,
    });
  } catch (err) {
    next(err);
  }
};

// exports.updateTemplate = async (req, res, next) => {
//   try {
//     const userId = req.user.id;
//     const { id } = req.params;
//     const { name, html, design } = req.body;

//     const template = await templates.findOne({ where: { id, userId } });
//     if (!template) return next(new ErrorHandler("Template not found", 404));

//     await template.update({
//       name: name || template.name,
//       html: html || template.html,
//       design: design || template.design,
//     });

//     return response(res, 200, "Template updated successfully", template);
//   } catch (err) {
//     next(err);
//   }
// };

// exports.deleteTemplate = async (req, res, next) => {
//   try {
//     const userId = req.user.id;
//     const { id } = req.params;

//     const template = await templates.findOne({ where: { id, userId } });
//     if (!template) return next(new ErrorHandler("Template not found", 404));

//     await template.destroy();
//     return response(res, 200, "Template deleted successfully");
//   } catch (err) {
//     next(err);
//   }
// };
