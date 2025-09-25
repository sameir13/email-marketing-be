const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "postgresql://neondb_owner:npg_dmW0c9hvyQTf@ep-rapid-mouse-a1x88oo0-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  {
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 10000,
    },
  }
);


const testDbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connection has been established successfully.");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
  }
};

module.exports = {
  sequelize,
  testDbConnection,
};
