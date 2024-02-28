import dotenv from 'dotenv'
dotenv.config()
let env = process.env.NOD_ENV
const config = {
    local: {
        PORT: process.env.PORT,
        // MONGO_URL1:
        //   "mongodb+srv://vijith:1234@cluster0.qyrtq.mongodb.net/super_vault?retryWrites=true&w=majority",
        // MONGO_URL:
        //   "mongodb+srv://vijith:vijith123@cluster0.mso81.mongodb.net/super_valt?retryWrites:true&w:majority",
        // MONGO_DEV_URL:
        //   "mongodb+srv://jithindas:ChillaR123@supervault.wpvc1tp.mongodb.net/supervault?retryWrites=true&w=majority",
        // email: "vijith.v@chillarcards.com",
        // password: "Vijith@123",
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION,
        REFRESH_JWT_SECRET: process.env.REFRESH_JWT_SECRET,
        REFRESH_EXPIRY: process.env.REFRESH_EXPIRY,
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        AWS_REGION: process.env.AWS_REGION,

        // SMS_SERVER: "https://sapteleservices.in/SMS_API/sendsms.php",
        // SMS_USER: "chillar",
        // SMS_PASSWORD: "chillar123",
        // WATI_TOKEN:
        //   "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkNzU2YmUyMC02ZjNiLTQ4ZGYtYWVhZS00MDJiOTg3YjA5MzYiLCJ1bmlxdWVfbmFtZSI6ImppdGhpbi5kYXNAY2hpbGxhcmNhcmRzLmNvbSIsIm5hbWVpZCI6ImppdGhpbi5kYXNAY2hpbGxhcmNhcmRzLmNvbSIsImVtYWlsIjoiaml0aGluLmRhc0BjaGlsbGFyY2FyZHMuY29tIiwiYXV0aF90aW1lIjoiMTAvMDUvMjAyMyAwNjowMjoyNiIsImRiX25hbWUiOiJ3YXRpX2FwcF90cmlhbCIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IlRSSUFMIiwiZXhwIjoxNjk3MTU1MjAwLCJpc3MiOiJDbGFyZV9BSSIsImF1ZCI6IkNsYXJlX0FJIn0.AZfqWsx5uWz9M5nIcYj2ceu1qtzN3Ky2u_tTvoBCeU4",
        // CONNECTION_LINK: "54.179.191.116",
        // OTP_PAGE_LINK: "http://localhost:3001",
        // OTP_PAGE: "local",
        // AWS_ACCESS_KEY: "AKIA3LMXN7HOKHEJ5CF5",
        // AWS_SECRET_KEY: "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",
    },
    dev: {
        PORT: process.env.PORT,
        // MONGO_URL1:
        //   "mongodb+srv://vijith:1234@cluster0.qyrtq.mongodb.net/super_vault?retryWrites=true&w=majority",
        // MONGO_URL:
        //   "mongodb+srv://vijith:vijith123@cluster0.mso81.mongodb.net/super_valt?retryWrites:true&w:majority",
        // MONGO_DEV_URL:
        //   "mongodb+srv://jithindas:ChillaR123@supervault.wpvc1tp.mongodb.net/supervault?retryWrites=true&w=majority",
        // email: "vijith.v@chillarcards.com",
        // password: "Vijith@123",
        // jwt_secrete: "super_valut_secrete",
        // SMS_SERVER: "https://sapteleservices.in/SMS_API/sendsms.php",
        // SMS_USER: "chillar",
        // SMS_PASSWORD: "chillar123",
        // WATI_TOKEN:
        //   "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkNzU2YmUyMC02ZjNiLTQ4ZGYtYWVhZS00MDJiOTg3YjA5MzYiLCJ1bmlxdWVfbmFtZSI6ImppdGhpbi5kYXNAY2hpbGxhcmNhcmRzLmNvbSIsIm5hbWVpZCI6ImppdGhpbi5kYXNAY2hpbGxhcmNhcmRzLmNvbSIsImVtYWlsIjoiaml0aGluLmRhc0BjaGlsbGFyY2FyZHMuY29tIiwiYXV0aF90aW1lIjoiMTAvMDUvMjAyMyAwNjowMjoyNiIsImRiX25hbWUiOiJ3YXRpX2FwcF90cmlhbCIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IlRSSUFMIiwiZXhwIjoxNjk3MTU1MjAwLCJpc3MiOiJDbGFyZV9BSSIsImF1ZCI6IkNsYXJlX0FJIn0.AZfqWsx5uWz9M5nIcYj2ceu1qtzN3Ky2u_tTvoBCeU4",
        // CONNECTION_LINK: "54.179.191.116",
        // OTP_PAGE_LINK: "http://54.179.191.116",
        // OTP_PAGE: "server",
        MYSQL_USER: process.env.MYSQL_USER,
        MYSQL_PASSWORD: process.env.MYSQL_PASSWORD,
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION,
        REFRESH_JWT_SECRET: process.env.REFRESH_JWT_SECRET,
        REFRESH_EXPIRY: process.env.REFRESH_EXPIRY,
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        AWS_REGION: process.env.AWS_REGION,
    },
}

let currentConfig = config[env]

export default currentConfig
