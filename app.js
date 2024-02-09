import express from "express";
import morgan from 'morgan'
import authRouter from './src/modules/authentication/v1/routes/authRoutes.js'
import workRouter from './src/modules/workSchedule/v1/routes/workScheduleRoutes.js'
import bookingrouter from './src/modules/booking/v1/routes/bookingRoutes.js';
import paymentRouter from './src/modules/payment/v1/routes/paymentRoutes.js';
import cors from 'cors';
import currentConfig from './config.js'
import Sequelize from './src/dbConnect.js';
// import auth from './src/middlewares/auth.js';

// import swaggerUiExpress from "swagger-ui-express";
// import { readFile } from "fs/promises";
// import multer from "multer";
// const upload = multer({ dest: "uploads/" });

const app = express();
global.appRoot = process.cwd()
// const swaggerDocument = JSON.parse(await readFile("./swagger.json"));

app.use(express.urlencoded({
    extended: false
}));
app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))
app.use(cors());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Origin', '*');
    next()
});


// const sequelize = new Sequelize({
//     dialect: 'mysql',
//     host: 'localhost',
//     // host: currentConfig.MYSQL_HOST,
//     // port: currentConfig.MYSQL_PORT,
//     // username: currentConfig.MYSQL_USER,
//     // password: currentConfig.MYSQL_PASSWORD,
//     // database: currentConfig.MYSQL_DATABASE,
//     logging: false, // Set to true to log SQL queries (optional)
//   });
  
//   // Test the database connection
//   Sequelize.authenticate()
//     .then(() => {
//       console.log('Database Connection Established');
//     })
//     .catch((error) => {
//       console.error('Database Connection Error:', error);
//     });

Sequelize.sync().then(() => {
    console.log('Connected to the database.');
  });
  
  
//*route to get the api doc
// app.use('/supervault/api',swaggerUiExpress.serve,swaggerUiExpress.setup(swaggerDocument))

app.get("/", (req, res) => {
    res.status(200).json({
        status: true,
        message: "welcome"
    });
})

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/work', workRouter);
app.use('/api/v1/booking', bookingrouter);
app.use('/api/v1/payment', paymentRouter)


 
app.post('*', (req, res) => {
    res.status(404).json({
        status: false,
        message: "Unknown path specified...."
    })
})
app.listen(currentConfig.PORT, (err) => {
    if (err) console.log(`server error.`);
    else console.log(`server is on ${currentConfig.PORT}`)
})