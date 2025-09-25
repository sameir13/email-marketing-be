const {
  users,
  templates,
  campaigns,
  senders,
  sequelize,
  contacts,
} = require("../../models");

async function alterTable() {
  try {
    await contacts.sync({ force: true });
    console.log(
      "The table for the emailconfiguration model was just (re)created!"
    );
  } catch (error) {
    console.error("Error syncing the table:", error.message);
  }
}

module.exports = { alterTable };
