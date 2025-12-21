const express = require("express");  //make api server
const cors = require("cors");   
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});
const { initDb, getDb } = require("./config/db");  // 
const { sendOtpEmail } = require("./utils/mailer");

const app = express();  // middlewares
app.use(express.json());  // json request porar jnno
app.use(cors());        // cross origin requests allow korar jnno

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";  // jwt token sign/verify korte use hoi
const OTP_TTL_MS = parseInt(process.env.OTP_TTL_MS || "180000", 10);

const defaultAdminEmail =
  process.env.DEFAULT_ADMIN_EMAIL || "tanmoypal30102004@gmail.com";
const defaultAdminPasswordHash =
  process.env.DEFAULT_ADMIN_PASSWORD_HASH || bcrypt.hashSync("tanmoy123", 10);
const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

let useMemoryStore = false;  // graceful degradation : mongodb na thakle in-memory store use korbe
const memAdmins = new Map();
const memOtps = new Map();

app.post("/api/admin/auth/send-otp", async (req, res) => { // send otp to admin email
  const { email } = req.body || {};
  if (!email)
    return res.status(400).json({ success: false, message: "Email required" });
  let admin;
  if (useMemoryStore) {
    admin = memAdmins.get(email);
  } else {
    const db = getDb();
    admin = await db.collection("admins").findOne({ email });
  }
  if (!admin || admin.role !== "admin") {   // check if admin
    return res.status(403).json({ success: false, message: "Not authorized" });
  }
  const code = generateOtp();
  const expiresAt = Date.now() + OTP_TTL_MS;
  if (useMemoryStore) {
    memOtps.set(email, { code, expiresAt });  // store otp in mongodb with expiry
  } else {
    const db = getDb();
    await db
      .collection("otps")
      .updateOne(
        { email },
        { $set: { email, code, expiresAt } },
        { upsert: true }
      );  // crud operation to store otp
  }
  const mailed = await sendOtpEmail(email, code, OTP_TTL_MS);
  console.log(
    `[OTP] Generated ${code} for ${email}, expires in ${Math.round(
      OTP_TTL_MS / 1000
    )}s. Email ${mailed ? "sent" : "not sent"}`
  );
  return res.json({
    success: true,
    message: "OTP sent to registered admin email",
    emailed: mailed,
  });
  return res.json({
    success: true,
    message: "OTP sent to registered admin email",
  });
});

app.post("/api/admin/auth/login", async (req, res) => {   // login with email, password, otp
  const { email, password, otp } = req.body || {};
  if (!email || !password || !otp) {
    return res
      .status(400)
      .json({ success: false, message: "Email, password, and OTP required" });
  }
  let admin, otpData;
  if (useMemoryStore) {
    admin = memAdmins.get(email);
    otpData = memOtps.get(email);
  } else {
    const db = getDb();
    admin = await db.collection("admins").findOne({ email });  // crud operation to read  admin
    otpData = await db.collection("otps").findOne({ email });  // crud operation to read otp
  }
  if (!admin || admin.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }
  if (!otpData || otpData.code !== otp || otpData.expiresAt < Date.now()) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired OTP" });
  }
  if (useMemoryStore) {
    memOtps.delete(email);
  } else {
    const db = getDb();
    await db.collection("otps").deleteOne({ email });  // crud operation to delete used otp
  }
  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok)
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  const token = jwt.sign({ sub: admin.email, role: admin.role }, JWT_SECRET, {
    expiresIn: "2h",  
  });  // token valid for 2 hours
  return res.json({ success: true, token, role: admin.role });
});

const authMiddleware = (req, res, next) => {  // token verify  by middleware
  const authHeader = req.headers.authorization || "";
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ success: false, message: "Missing token" });
  }
  try {
    const payload = jwt.verify(parts[1], JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

app.get("/api/admin/dashboard", authMiddleware, (req, res) => {  //token chara access pabe na
  if (req.user?.role !== "admin")
    return res.status(403).json({ success: false, message: "Forbidden" });
  return res.json({
    success: true,
    data: { summary: "Secure admin dashboard data", email: req.user.sub },
  });
});

const port = parseInt(process.env.PORT || "4000", 10);
(async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("MONGODB_URI not set. Falling back to in-memory store.");  // mongodb na thakle in-memory store use korbe
    useMemoryStore = true;
  } else {
    const connected = await initDb(uri);
    if (!connected) {
      console.warn("MongoDB unavailable. Falling back to in-memory store.");
      useMemoryStore = true;
    } else {
      const db = getDb();
      await db.collection("admins").updateOne(
        { email: defaultAdminEmail },
        {
          $setOnInsert: {
            email: defaultAdminEmail,
            role: "admin",
            passwordHash: defaultAdminPasswordHash,
          },
        },
        { upsert: true }
      );
    }
  }
  if (useMemoryStore) {
    memAdmins.set(defaultAdminEmail, {
      email: defaultAdminEmail,
      role: "admin",
      passwordHash: defaultAdminPasswordHash,
    });
  }
  app.listen(port, () => {
    console.log(`Admin Auth API running on http://localhost:${port}`);
  });
})();
