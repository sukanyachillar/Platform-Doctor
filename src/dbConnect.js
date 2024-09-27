import currentConfig from "../config.js";
import Sequelize from "sequelize";

let sequelize;

if (process.env.DB_APP == "new") {
  sequelize = new Sequelize("doctorapp_new", "doctor_new", "", {
    dialect: "mysql",
    // host: 'localhost',
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    username: "doctor_new",
    password: "Doctor@2024",
    // database: currentConfig.MYSQL_DATABASE,
    logging: false, // Set to true to log SQL queries (optional)
  });
} else {
  sequelize = new Sequelize(process.env.MYSQL_DB, process.env.MYSQL_USER, "", {
    dialect: "mysql",
    // host: 'localhost',
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    // database: currentConfig.MYSQL_DATABASE,
    logging: false, // Set to true to log SQL queries (optional)
  });
}

// const sequelize = new Sequelize('platform_doctor', 'root', '', {
//       host: 'localhost',
//       dialect: 'mysql',
//       logging: false
// });

export default sequelize;
