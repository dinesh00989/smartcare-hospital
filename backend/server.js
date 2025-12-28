// ================= ENV =================
require("dotenv").config();

// ================= IMPORTS =================
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;

// ================= APP =================
const app = express();
app.use(express.json());

// ================= CORS =================
app.use(cors({
  origin: true,
  credentials: true
}));

// ================= SESSION =================
app.use(session({
  secret: "smartcare-secret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI
  })
}));

// ================= DB CONNECT =================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error", err));

// ================= MODELS =================

// User
const User = mongoose.model("User", new mongoose.Schema({
  username: String,
  password: String,
  role: String
}));

// Appointment
const Appointment = mongoose.model("Appointment", new mongoose.Schema({
  patientName: String,
  age: Number,
  doctor: String,
  date: String,
  symptoms: String
}));

// Prescription
const Prescription = mongoose.model("Prescription", new mongoose.Schema({
  patientName: String,
  doctor: String,
  diagnosis: String,
  medicines: String,
  notes: String,
  date: String
}));

// ================= SEED USERS =================
async function seedUsers() {
  await User.deleteMany();

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

  console.log("👥 Users in DB:");
  console.log(await User.find());
}

seedUsers();

// ================= AUTH MIDDLEWARE =================
function requireRole(role) {
  return (req, res, next) => {
    if (!req.session.user)
      return res.status(401).json({ message: "Login required" });

    if (req.session.user.role !== role)
      return res.status(403).json({ message: "Access denied" });

    next();
  };
}

// ================= ROUTES =================

// Root
app.get("/", (req, res) => {
  res.send("🚀 SmartCare Backend Running");
});

// Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ message: "Invalid user" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: "Wrong password" });

  req.session.user = { id: user._id, role: user.role };
  res.json({ role: user.role });
});

// Logout
app.post("/logout", (req, res) => {
  req.session.destroy(() => res.json({ message: "Logged out" }));
});

// Appointments
app.post("/appointments", async (req, res) => {
  await Appointment.create(req.body);
  res.json({ message: "Appointment saved" });
});

app.get("/appointments", async (req, res) => {
  res.json(await Appointment.find());
});

// Prescriptions
app.post("/prescriptions", async (req, res) => {
  await Prescription.create(req.body);
  res.json({ message: "Prescription saved" });
});

app.get("/prescriptions", async (req, res) => {
  res.json(await Prescription.find());
});

// Dashboards
app.get("/admin/dashboard", requireRole("admin"), (req, res) => {
  res.send("Welcome Admin 👩‍💼");
});

app.get("/doctor/dashboard", requireRole("doctor"), (req, res) => {
  res.send("Welcome Doctor 👨‍⚕️");
});

// ================= START =================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
