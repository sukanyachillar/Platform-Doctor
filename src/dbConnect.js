import currentConfig from '../config.js'
import Sequelize from 'sequelize'

const sequelize = new Sequelize('platform_doctor', 'root', '', {
    dialect: 'mysql',
    host: 'localhost',
    // host: currentConfig.MYSQL_HOST,
    // port: currentConfig.MYSQL_PORT,
    username: currentConfig.MYSQL_USER,
    password: currentConfig.MYSQL_PASSWORD,
    // database: currentConfig.MYSQL_DATABASE,
    logging: false, // Set to true to log SQL queries (optional)
})

// const sequelize = new Sequelize('sample', 'root', '', {
//   host: 'localhost',
//   dialect: 'mysql',
// });
export default sequelize
