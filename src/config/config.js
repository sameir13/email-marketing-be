require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'neondb_owner',
    password: process.env.DB_PASSWORD || 'npg_dmW0c9hvyQTf',
    database: process.env.DB_NAME || 'neondb',
    host: process.env.DB_HOST || 'ep-rapid-mouse-a1x88oo0-pooler.ap-southeast-1.aws.neon.tech',
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
  test: {
    username: process.env.DB_USERNAME || 'neondb_owner',
    password: process.env.DB_PASSWORD || 'npg_dmW0c9hvyQTf',
    database: process.env.DB_NAME || 'neondb_test',
    host: process.env.DB_HOST || 'ep-rapid-mouse-a1x88oo0-pooler.ap-southeast-1.aws.neon.tech',
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};