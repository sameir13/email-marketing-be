const { contacts, tags, contact_tags } = require("../models");
const ErrorHandler = require("../utils/global/errorHandler.js");
const response = require("../utils/global/response.js");

exports.createTag = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    const existingTag = await tags.findOne({
      where: { name, isDeleted: false },
    });

    if (existingTag) {
      return next(new ErrorHandler("Tag already exists", 400));
    }

    const tag = await tags.create({
      name,
      userId,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Tag created successfully",
      data: tags,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error creating tag", error: err.message });
  }
};

exports.deleteTag = async (req, res) => {
  try {
    const { id } = req.params;

    const tag = await tags.findByPk(id);
    if (!tag || tag.isDeleted) {
      return res.status(404).json({ message: "Tag not found" });
    }

    await tag.update({ isDeleted: true });

    // response.success(res, "Tag deleted (soft)", 200);

    res.status(200).json({
      success: true,
      message: "Tag deleted (soft)",
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error deleting tag", error: err.message });
  }
};

exports.getAllTags = async (req, res) => {
  try {
    const userId = req.user.id;
    const fetchAllTags = await tags.findAll({
      where: { isDeleted: false, userId },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      message: "Tags fetched successfully",
      data: fetchAllTags,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error fetching tags", error: err.message });
  }
};

exports.getContacts = async (req, res) => {
  try {
    const { tag } = req.query;

    const includeOptions = {
      model: tags,
      attributes: ["id", "name"],
      through: { attributes: [] },
      where: {},
      required: false,
    };

    if (tag) {
      const tagList = tag.split(",").map((t) => t.trim());
      includeOptions.where = { name: tagList, isDeleted: false };
      includeOptions.required = true;
    }

    const allContacts = await contacts.findAll({
      include: [includeOptions],
      distinct: true,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      message: "Contacts fetched successfully",
      data: allContacts,
    });
  } catch (err) {
    return response.error(res, "Error fetching contacts", err.message);
  }
};

exports.addContacts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const payload = req.body;

    const hasUserListName = await contacts.findOne({
      where: {
        userId,
        listName: payload?.listName,
      },
    });

    if (hasUserListName) {
      return next(new ErrorHandler("List name already exists", 400));
    }

    const formatedData = payload?.list?.map((row, index) => {
      return {
        userId,
        ...row,
      };
    });

    const addBulkComtacts = await contacts.bulkCreate(formatedData);

    res.status(200).json({
      success: true,
      message: "Contact list created!",
    });
  } catch (err) {
    console.log(err);
    // return response.error(res, "Error fetching contacts", err.message);
  }
};

exports.getContacts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { listName } = req.query;

    const where = { userId };

    if (listName != "all") where.listName = listName;

    const allContacts = await contacts.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });



    const listNames = await contacts.findAll({
      where: { userId },
      attributes: [
        [
          contacts.sequelize.fn("DISTINCT", contacts.sequelize.col("listName")),
          "listName",
        ],
      ],
      raw: true,
    });

    res.status(200).json({
      success: true,
      data: allContacts,
      listNames: listNames.map((l) => l.listName),
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
