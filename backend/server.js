/****************************************
 SMARTCARE – FINAL EXAM-SAFE BACKEND
 Admin CRUD (NO SESSIONS, NO COOKIES)
*****************************************/

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/* ========= MIDDLEWARE ========= */
app.use(express.json());
app.use(cors({
  origin: "https://dinesh00989.github.io"
}));

/* ========= DATABASE ========= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => {
    console.error("❌ MongoDB Error", err);
    process.exit(1);
  });

/* ========= MODEL ========= */
const Appointment = mongoose.model("Appointment", new mongoose.Schema({
  patientName: String,
  doctor: String,
  date: String
}));

/* ========= HEALTH ========= */
app.get("/", (_, res) => res.send("🚀 SmartCare Backend Running"));

/* ========= APPOINTMENTS ========= */
app.post("/appointments", async (req, res) => {
  const data = await Appointment.create(req.body);
  res.json(data);
});

/* ========= ADMIN (NO AUTH LOOP) ========= */
app.get("/admin/appointments", async (_, res) => {
  const data = await Appointment.find().sort({ _id: -1 });
  res.json(data);
});

app.delete("/admin/appointments/:id", async (req, res) => {
  await Appointment.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

/* ========= START ========= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
