/****************************************
 SMARTCARE – FINAL BACKEND SERVER
 Admin + Doctor + Appointments + Prescriptions
 Stable • Exam Safe • Production Ready
*****************************************/

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/* =======================
   MIDDLEWARE
======================= */
app.use(express.json());

app.use(cors({
  origin: "*"
}));

/* =======================
   DATABASE
======================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => {
    console.error("❌ MongoDB Error", err);
    process.exit(1);
  });

/* =======================
   MODELS
======================= */
const User = mongoose.model("User", new mongoose.Schema({
  username: String,
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

/* =======================
   SEED DOCTORS (ONCE)
======================= */
async function seedDoctors() {
  if (await User.countDocuments() > 0) return;

  await User.insertMany([
    { username: "drrao", role: "doctor" },
    { username: "drmeena", role: "doctor" },
    { username: "drkumar", role: "doctor" },
    { username: "drsharma", role: "doctor" }
  ]);

  console.log("👨‍⚕️ Doctors seeded");
}
seedDoctors();

/* =======================
   ROUTES
======================= */

/* HEALTH CHECK */
app.get("/", (_, res) => {
  res.send("🚀 SmartCare Backend Running");
});

/* ---------- APPOINTMENTS ---------- */
app.get("/appointments", async (_, res) => {
  const data = await Appointment.find().sort({ _id: -1 });
  res.json(data);
});

app.post("/appointments", async (req, res) => {
  await Appointment.create(req.body);
  res.json({ message: "Appointment saved" });
});

app.delete("/appointments/:id", async (req, res) => {
  await Appointment.findByIdAndDelete(req.params.id);
  res.json({ message: "Appointment deleted" });
});

/* ---------- PRESCRIPTIONS ---------- */
app.get("/prescriptions", async (_, res) => {
  const data = await Prescription.find().sort({ _id: -1 });
  res.json(data);
});

app.post("/prescriptions", async (req, res) => {
  await Prescription.create(req.body);
  res.json({ message: "Prescription saved" });
});

app.delete("/prescriptions/:id", async (req, res) => {
  await Prescription.findByIdAndDelete(req.params.id);
  res.json({ message: "Prescription deleted" });
});

/* ---------- DOCTORS ---------- */
app.get("/doctors", async (_, res) => {
  const data = await User.find({ role: "doctor" });
  res.json(data);
});

/* =======================
   START SERVER
======================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
