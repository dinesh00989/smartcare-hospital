/*************************************************
 SMARTCARE – FINAL FRONTEND MASTER SCRIPT
 GitHub Pages + Render Compatible
**************************************************/

/* ========== CONFIG ========== */
const API = "https://smartcare-hospital.onrender.com";

/* ========== UTIL ========== */
function $(id) {
  return document.getElementById(id);
}

/* =================================================
   APPOINTMENTS (PUBLIC)
================================================= */
async function addAppointment() {
  const patientName = $("aptPatient")?.value.trim();
  const doctor = $("aptDoctor")?.value;
  const date = $("aptDate")?.value;

  if (!patientName || !doctor || !date) {
    alert("Please fill all fields");
    return;
  }

  try {
    const res = await fetch(`${API}/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientName, doctor, date })
    });

    if (!res.ok) throw new Error();

    alert("✅ Appointment booked successfully");
    $("aptPatient").value = "";
    $("aptDate").value = "";
    $("aptDoctor").value = "";

  } catch {
    alert("❌ Error saving appointment");
  }
}

/* =================================================
   DOCTOR LOGIN
================================================= */
async function doctorLogin() {
  const username = $("docUser").value.trim().toLowerCase();
  const password = $("docPass").value.trim();
  $("loginError").textContent = "";

  try {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) throw new Error();

    const data = await res.json();
    if (data.role !== "doctor") throw new Error();

    localStorage.setItem("doctorName", data.username);
    showDoctorDashboard();

  } catch {
    $("loginError").textContent = "Invalid doctor credentials";
  }
}

/* =================================================
   DOCTOR DASHBOARD
================================================= */
function showDoctorDashboard() {
  if ($("doctorLoginBox")) $("doctorLoginBox").style.display = "none";
  if ($("doctorDashboard")) $("doctorDashboard").style.display = "block";
  loadDoctorAppointments();
}

async function loadDoctorAppointments() {
  const doctor = localStorage.getItem("doctorName");
  const wrap = $("doctorAppointmentCards");
  if (!doctor || !wrap) return;

  wrap.innerHTML = "Loading...";

  try {
    const res = await fetch(`${API}/appointments/${encodeURIComponent(mapDoctor(doctor))}`);
    if (!res.ok) throw new Error();

    const data = await res.json();
    wrap.innerHTML = "";

    if (!data.length) {
      wrap.innerHTML = "<p>No appointments yet</p>";
      return;
    }

    data.forEach(a => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <b>Patient:</b> ${a.patientName}<br>
        <b>Date:</b> ${a.date}
      `;
      wrap.appendChild(card);
    });

  } catch {
    wrap.innerHTML = "<p>Error loading appointments</p>";
  }
}

function mapDoctor(username) {
  return {
    drrao: "Dr. A. Rao",
    drmeena: "Dr. Meena S.",
    drkumar: "Dr. K. Kumar",
    drsharma: "Dr. P. Sharma"
  }[username];
}

/* =================================================
   DOCTOR LOGOUT
================================================= */
function doctorLogout() {
  localStorage.removeItem("doctorName");
  location.reload();
}

/* =================================================
   PRESCRIPTIONS (DOCTOR)
================================================= */
async function savePrescription() {
  const patientName = $("prePatient").value.trim();
  const medicines = $("medicine").value.trim();
  const doctorKey = localStorage.getItem("doctorName");
  const doctor = mapDoctor(doctorKey);

  if (!patientName || !medicines || !doctor) {
    alert("Fill all fields");
    return;
  }

  try {
    const res = await fetch(`${API}/prescriptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientName,
        doctor,
        diagnosis: $("pvTemplate")?.textContent || "",
        medicines,
        date: new Date().toLocaleDateString()
      })
    });

    if (!res.ok) throw new Error();

    alert("✅ Prescription saved");
    $("prePatient").value = "";
    $("medicine").value = "";

  } catch {
    alert("❌ Error saving prescription");
  }
}

/* =================================================
   ADMIN LOGIN (FRONTEND SAFE)
================================================= */
function adminLogin() {
  const u = $("adminUser").value.trim();
  const p = $("adminPass").value.trim();

  if (u === "admin" && p === "admin") {
    localStorage.setItem("adminLoggedIn", "true");
    location.href = "admin-dashboard.html";
  } else {
    $("loginError").textContent = "Invalid admin credentials";
  }
}

/* =================================================
   ADMIN DASHBOARD
================================================= */
async function loadAdminData() {
  if (localStorage.getItem("adminLoggedIn") !== "true") {
    location.href = "admin-login.html";
    return;
  }

  /* Appointments */
  fetch(`${API}/admin/appointments`)
    .then(r => r.json())
    .then(d => {
      d.forEach(a => {
        apt.innerHTML += `
          <tr>
            <td>${a.patientName}</td>
            <td>${a.doctor}</td>
            <td>${a.date}</td>
            <td><button onclick="deleteAppointment('${a._id}')">Delete</button></td>
          </tr>`;
      });
    });

  /* Prescriptions */
  fetch(`${API}/admin/prescriptions`)
    .then(r => r.json())
    .then(d => {
      d.forEach(p => {
        rx.innerHTML += `
          <tr>
            <td>${p.patientName}</td>
            <td>${p.doctor}</td>
            <td>${p.medicines}</td>
            <td>${p.date}</td>
            <td><button onclick="deletePrescription('${p._id}')">Delete</button></td>
          </tr>`;
      });
    });
}

function deleteAppointment(id) {
  fetch(`${API}/admin/appointments/${id}`, { method: "DELETE" })
    .then(() => location.reload());
}

function deletePrescription(id) {
  fetch(`${API}/admin/prescriptions/${id}`, { method: "DELETE" })
    .then(() => location.reload());
}

/* =================================================
   AUTO INIT
================================================= */
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("doctorName") && $("doctorDashboard")) {
    showDoctorDashboard();
  }
  if ($("apt") && $("rx")) {
    loadAdminData();
  }
});
