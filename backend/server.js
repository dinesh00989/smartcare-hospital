require("dotenv").config({ path: __dirname + "/.env" });

// ================= IMPORTS =================
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

// ================= APP SETUP =================
const app = express();
app.use(express.json());

// ✅ CORS (works locally + after deployment)
app.use(cors({
  origin: "*"
}));

// ================= ENV VARIABLES =================
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

// ================= MONGODB CONNECT (ATLAS) =================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas connected ✅"))
  .catch(err => console.log("MongoDB error ❌", err));

// ================= MODEL =================
const DoctorSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String   // admin | doctor
});

const Doctor = mongoose.model("Doctor", DoctorSchema);

// ================= ROOT =================
app.get("/", (req, res) => {
  res.send("SmartCare Backend Running ✅");
});

// ================= REGISTER (TEMP) =================
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const exists = await Doctor.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await Doctor.create({
      name,
      email,
      password: hashed,
      role
    });

    res.json({ message: "Registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Register error" });
  }
});

// ================= LOGIN (JWT) =================
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Doctor.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      role: user.role
    });
  } catch (err) {
    res.status(500).json({ message: "Login error" });
  }
});

// ================= AUTH MIDDLEWARE =================
function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// ================= ROLE CHECK =================
function roleCheck(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
}

// ================= DASHBOARD TEST ROUTES =================
app.get("/admin/dashboard", auth, roleCheck("admin"), (req, res) => {
  res.send("Welcome Admin 👩‍💼");
});

app.get("/doctor/dashboard", auth, roleCheck("doctor"), (req, res) => {
  res.send("Welcome Doctor 👨‍⚕️");
});

// ================= START SERVER =================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});
