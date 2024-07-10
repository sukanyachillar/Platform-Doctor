import currentConfig from '../config.js'
import Sequelize from 'sequelize'

const sequelize = new Sequelize('doctorapp', process.env.MYSQL_USER, '', {
    dialect: 'mysql',
    // host: 'localhost',
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    // database: currentConfig.MYSQL_DATABASE,
    logging: false, // Set to true to log SQL queries (optional)
});

// const sequelize = new Sequelize('platform_doctor', 'root', '', {
//       host: 'localhost',
//       dialect: 'mysql',
//       logging: false
// });

export default sequelize;
