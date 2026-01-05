/****************************************
 SMARTCARE – FINAL GLOBAL BACKEND SERVER
 GitHub Pages + Render Compatible
*****************************************/

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();

/* ============ MIDDLEWARE ============ */
app.use(express.json());
app.use(cors({
  origin: "https://dinesh00989.github.io"
}));

/* ============ DATABASE ============ */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => {
    console.error("❌ MongoDB Error", err);
    process.exit(1);
  });

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
  date: String
}));

/* ============ SEED USERS (ONCE) ============ */
(async function seedUsers() {
  if (await User.countDocuments()) return;

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
})();

/* ============ HEALTH CHECK ============ */
app.get("/", (_, res) => {
  res.send("🚀 SmartCare Backend Running");
});

/* ============ AUTH ============ */
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({});

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({});

  res.json({ role: user.role, username });
});

/* ============ APPOINTMENTS ============ */
app.post("/appointments", async (req, res) => {
  const data = await Appointment.create(req.body);
  res.json(data);
});

/* Doctor view */
app.get("/appointments/:doctor", async (req, res) => {
  const data = await Appointment.find({ doctor: req.params.doctor });
  res.json(data);
});

/* Admin view */
app.get("/admin/appointments", async (_, res) => {
  const data = await Appointment.find().sort({ _id: -1 });
  res.json(data);
});

app.delete("/admin/appointments/:id", async (req, res) => {
  await Appointment.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

/* ============ PRESCRIPTIONS ============ */
app.post("/prescriptions", async (req, res) => {
  const data = await Prescription.create(req.body);
  res.json(data);
});

app.get("/admin/prescriptions", async (_, res) => {
  const data = await Prescription.find().sort({ _id: -1 });
  res.json(data);
});

app.delete("/admin/prescriptions/:id", async (req, res) => {
  await Prescription.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

/* ============ START ============ */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
