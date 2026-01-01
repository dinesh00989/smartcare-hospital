/*************************************************
 SMARTCARE – FINAL BACKEND-ONLY SCRIPT
 ONE SOURCE OF TRUTH: MONGODB ATLAS
**************************************************/

const API = "https://smartcare-hospital.onrender.com";

/* ================= APPOINTMENTS ================= */
function addAppointment() {
  const patientName = document.getElementById("aptPatient")?.value.trim();
  const doctor = document.getElementById("aptDoctor")?.value;
  const date = document.getElementById("aptDate")?.value;

  if (!patientName || !doctor || !date) {
    alert("Fill all fields");
    return;
  }

  fetch(`${API}/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ patientName, doctor, date })
  })
    .then(res => res.json())
    .then(() => {
      alert("✅ Appointment saved to database");
      document.getElementById("aptPatient").value = "";
      document.getElementById("aptDate").value = "";
    })
    .catch(() => alert("❌ Backend error"));
}

/* ================= DOCTOR LOGIN ================= */
function doctorLogin() {
  const username = document.getElementById("docUser").value.trim().toLowerCase();
  const password = document.getElementById("docPass").value.trim();

  fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password })
  })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(() => {
      window.location.href = "prescription.html";
    })
    .catch(() => {
      document.getElementById("loginError").textContent = "Invalid credentials";
    });
}

/* ================= LOAD APPOINTMENTS ================= */
function loadDoctorAppointments() {
  fetch(`${API}/appointments`, { credentials: "include" })
    .then(res => res.json())
    .then(data => {
      const wrap = document.getElementById("doctorAppointmentCards");
      if (!wrap) return;

      wrap.innerHTML = "";
      if (!data.length) {
        wrap.innerHTML = "<p>No appointments</p>";
        return;
      }

      data.forEach(a => {
        const d = document.createElement("div");
        d.className = "card";
        d.innerHTML = `<b>${a.patientName}</b><br>${a.date}`;
        wrap.appendChild(d);
      });
    });
}

/* ================= LOGOUT ================= */
function doctorLogout() {
  fetch(`${API}/logout`, {
    method: "POST",
    credentials: "include"
  }).then(() => window.location.href = "index.html");
}
