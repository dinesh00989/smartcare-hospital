/****************************************
 SMARTCARE – FINAL BACKEND SERVER
 Stable • Secure • Netlify + Render Ready
*****************************************/

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const app = express();

/* ============ MIDDLEWARE ============ */
app.use(express.json());

app.use(cors({
  origin: "*", // Netlify + local
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Allow preflight requests
app.options("*", cors());

/* ============ SESSION ============ */
app.use(session({
  name: "smartcare.sid",
  secret: "smartcare-secret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI
  }),
  cookie: {
    httpOnly: true,
    secure: false, // true only if HTTPS + custom domain
    maxAge: 1000 * 60 * 60 // 1 hour
  }
}));

/* ============ DATABASE ============ */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error", err));

/* ============ MODELS ============ */
const User = mongoose.model("User", new mongoose.Schema({
  username: String,
  password: String,
  role: String
}));

const Appointment = mongoose.model("Appointment", new mongoose.Schema({
  patientName: String,
  age: Number,
  doctor: String,
  date: String,
  symptoms: String
}));

const Prescription = mongoose.model("Prescription", new mongoose.Schema({
  patientName: String,
  doctor: String,
  diagnosis: String,
  medicines: String,
  notes: String,
  date: String
}));

/* ============ SEED USERS (SAFE) ============ */
async function seedUsers() {
  const count = await User.countDocuments();
  if (count > 0) {
    console.log("👥 Users already exist");
    return;
  }

  const users = [
    { username: "admin", password: "admin", role: "admin" },
    { username: "drrao", password: "doctor", role: "doctor" },
    { username: "drmeena", password: "doctor", role: "doctor" },
    { username: "drkumar", password: "doctor", role: "doctor" },
    { username: "drsharma", password: "doctor", role: "doctor" }
  ];

  for (let u of users) {
    const hashed = await bcrypt.hash(u.password, 10);
    await User.create({ ...u, password: hashed });
  }

  console.log("👥 Default users created");
}
seedUsers();

/* ============ AUTH HELPERS ============ */
function isLoggedIn(req, res, next) {
  if (!req.session.user)
    return res.status(401).json({ message: "Login required" });
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.session.user.role !== role)
      return res.status(403).json({ message: "Access denied" });
    next();
  };
}

/* ============ ROUTES ============ */

// Root
app.get("/", (req, res) => {
  res.send("🚀 SmartCare Backend Running");
});

// Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  req.session.user = {
    id: user._id,
    username: user.username,
    role: user.role
  };

  res.json({ role: user.role });
});

// Logout
app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

// Create Appointment (Patient)
app.post("/appointments", async (req, res) => {
  await Appointment.create(req.body);
  res.json({ message: "Appointment saved" });
});

// Get Appointments (Doctor only – filtered)
app.get("/appointments", isLoggedIn, requireRole("doctor"), async (req, res) => {
  const doctorMap = {
    drrao: "Dr. A. Rao",
    drmeena: "Dr. Meena S.",
    drkumar: "Dr. K. Kumar",
    drsharma: "Dr. P. Sharma"
  };

  const doctorName = doctorMap[req.session.user.username];
  const data = await Appointment.find({ doctor: doctorName });

  res.json(data);
});

// Prescriptions
app.post("/prescriptions", isLoggedIn, requireRole("doctor"), async (req, res) => {
  await Prescription.create(req.body);
  res.json({ message: "Prescription saved" });
});

app.get("/prescriptions", isLoggedIn, async (req, res) => {
  res.json(await Prescription.find());
});

// Dashboards
app.get("/admin/dashboard", isLoggedIn, requireRole("admin"), (req, res) => {
  res.send("Welcome Admin 👩‍💼");
});

app.get("/doctor/dashboard", isLoggedIn, requireRole("doctor"), (req, res) => {
  res.send("Welcome Doctor 👨‍⚕️");
});

/* ============ START SERVER ============ */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
