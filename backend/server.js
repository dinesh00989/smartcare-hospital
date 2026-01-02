require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(express.json());

app.use(cors({
  origin: "https://dinesh00989.github.io",
  methods: ["GET", "POST", "DELETE"],
}));

/* ================= DATABASE ================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error", err));

/* ================= MODELS ================= */
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

/* ================= ROUTES ================= */

// health check
app.get("/", (req, res) => {
  res.send("SmartCare Backend Running");
});

/* ---- Appointments ---- */
app.post("/appointments", async (req, res) => {
  await Appointment.create(req.body);
  res.json({ message: "Appointment saved" });
});

app.get("/admin/appointments", async (req, res) => {
  const data = await Appointment.find();
  res.json(data);
});

app.delete("/admin/appointments/:id", async (req, res) => {
  await Appointment.findByIdAndDelete(req.params.id);
  res.json({ message: "Appointment deleted" });
});

/* ---- Prescriptions ---- */
app.post("/prescriptions", async (req, res) => {
  await Prescription.create(req.body);
  res.json({ message: "Prescription saved" });
});

app.get("/admin/prescriptions", async (req, res) => {
  const data = await Prescription.find();
  res.json(data);
});

app.delete("/admin/prescriptions/:id", async (req, res) => {
  await Prescription.findByIdAndDelete(req.params.id);
  res.json({ message: "Prescription deleted" });
});

/* ================= START ================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
