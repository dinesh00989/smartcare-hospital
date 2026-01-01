/****************************************
 SMARTCARE – FINAL BACKEND SERVER
 Atlas DB Forced • Render Safe • Exam Safe
*****************************************/

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
const session = require("express-session");

const app = express();

/* ============ MIDDLEWARE ============ */
app.use(express.json());

app.use(cors({
  origin: [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "https://dinesh00989.github.io"
  ],
  credentials: true
}));

/* ============ DATABASE (FORCE DB NAME) ============ */
mongoose.connect(process.env.MONGO_URI, {
  dbName: "smartcare"   // 🔥 FORCE DB
})
.then(() => {
  console.log("✅ MongoDB Atlas connected to DB: smartcare");
})
.catch(err => {
  console.error("❌ MongoDB connection error:", err);
  process.exit(1);
});

/* ============ SESSION ============ */
app.use(session({
  name: "smartcare.sid",
  secret: "smartcare-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60
  }
}));

/* ============ MODELS ============ */
const User = mongoose.model("User", new mongoose.Schema({
  username: String,
  password: String,
  role: String
}));

const Appointment = mongoose.model("Appointment", new mongoose.Schema({
  patientName: String,
  doctor: String,
  date: String
}));

const Prescription = mongoose.model("Prescription", new mongoose.Schema({
  patientName: String,
  doctor: String,
  diagnosis: String,
  medicines: String,
  notes: String,
  date: String
}));

/* ============ SEED USERS (ONCE) ============ */
async function seedUsers() {
  if (await User.countDocuments() > 0) return;

  const users = [
    { username: "admin", password: "admin", role: "admin" },
    { username: "drrao", password: "doctor", role: "doctor" },
    { username: "drmeena", password: "doctor", role: "doctor" },
    { username: "drkumar", password: "doctor", role: "doctor" },
    { username: "drsharma", password: "doctor", role: "doctor" }
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    await User.create({ ...u, password: hash });
  }

  console.log("👥 Default users seeded");
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
app.get("/", (_, res) => {
  res.send("🚀 SmartCare Backend Running");
});

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

  console.log("✅ Login:", username);
  res.json({ role: user.role });
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("smartcare.sid");
    res.json({ message: "Logged out" });
  });
});

/* ============ APPOINTMENTS (DB PROOF) ============ */
app.post("/appointments", async (req, res) => {
  console.log("📥 Incoming appointment:", req.body);

  const saved = await Appointment.create(req.body);

  console.log("✅ Appointment stored in Atlas:", saved._id);
  res.json(saved);
});

app.get("/appointments", isLoggedIn, requireRole("doctor"), async (req, res) => {
  const map = {
    drrao: "Dr. A. Rao",
    drmeena: "Dr. Meena S.",
    drkumar: "Dr. K. Kumar",
    drsharma: "Dr. P. Sharma"
  };

  const doctor = map[req.session.user.username];
  const data = await Appointment.find({ doctor });

  res.json(data);
});

/* ============ PRESCRIPTIONS ============ */
app.post("/prescriptions", async (req, res) => {
  const saved = await Prescription.create(req.body);
  console.log("📄 Prescription saved:", saved._id);
  res.json(saved);
});

/* ============ START SERVER ============ */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
