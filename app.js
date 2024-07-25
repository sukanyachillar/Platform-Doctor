import express from "express";
import morgan from "morgan";
import authRouter from "./src/modules/authentication/v1/routes/authRoutes.js";
import workRouter from "./src/modules/workSchedule/v1/routes/workScheduleRoutes.js";
import bookingrouter from "./src/modules/booking/v1/routes/bookingRoutes.js";
import paymentRouter from "./src/modules/payment/v1/routes/paymentRoutes.js";
import businessRouter from "./src/modules/business/v1/routes/businessRoutes.js";
import adminRouter from "./src/modules/admin/v1/routes/adminRoutes.js";
import customerRouter from "./src/modules/customer/routes/customerRoutes.js";
import clinicRouter from "./src/modules/clinic/routes/clinicRoutes.js";
import associateModels from "./src/models/index.js";
import moment from "moment";
import cors from "cors";
import cron from "node-cron";
import currentConfig from "./config.js";
import Sequelize from "./src/dbConnect.js";
import cronJobs from "./src/utils/cronJobs.js";

const app = express();
global.appRoot = process.cwd();

app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(express.json());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);
app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

Sequelize.sync().then(() => {
  console.log("Connected to the database.");
});

await associateModels();

// const models = {
//     doctorEntityModel,
//     doctorModel,
//     departmentModel,
// };

// Object.values(models).forEach(model => {
//     if (model.associate) {
//          model.associate(models);
//     }
// });
// await Promise.all(Object.values(models).map(async (model) => {
//     if (model.associate) {
//         await model.associate(models);
//     }
// }))

cron.schedule("5 0 * * *", async () => {
  cronJobs.timeSlotCron();
});

cron.schedule("*/10 * * * *", async () => {
  await cronJobs.paymentVerifyCheck();
});

cron.schedule("*/10 * * * *", async () => {
  await cronJobs.blockedSlotCheck();
});

// cronJobs.timeSlotCron();

app.get("/api", (req, res) => {
  res.status(200).json({
    status: true,
    message: "welcome",
  });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/work", workRouter);
app.use("/api/v1/booking", bookingrouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/app", businessRouter);
app.use("/api/v1/customer", customerRouter);
app.use("/api/v1/clinic", clinicRouter);

app.post("*", (req, res) => {
  res.status(404).json({
    status: false,
    message: "Unknown path specified....",
  });
});

app.listen(currentConfig.PORT, (err) => {
  if (err) console.log(`server error.`);
  else console.log(`server is on ${currentConfig.PORT}`);
});
