/*************************************************
 SMARTCARE – FINAL STABLE FRONTEND SCRIPT
 Appointments • Doctors • Prescriptions • Admin
 GitHub Pages + Render + Atlas (NO sessions)
**************************************************/

/* ================= CONFIG ================= */
const API = "https://smartcare-hospital.onrender.com";

/* ================= UTIL ================= */
function $(id) {
  return document.getElementById(id);
}

/* =================================================
   APPOINTMENTS (PUBLIC – WORKING REFERENCE)
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

    alert("✅ Appointment booked");
    $("aptPatient").value = "";
    $("aptDate").value = "";
    $("aptDoctor").value = "";

  } catch {
    alert("❌ Failed to book appointment");
  }
}

/* =================================================
   DOCTOR LOGIN (FRONTEND ONLY)
================================================= */
const DOCTORS = {
  drrao: "Dr. A. Rao",
  drmeena: "Dr. Meena S.",
  drkumar: "Dr. K. Kumar",
  drsharma: "Dr. P. Sharma"
};

function doctorLogin() {
  const u = $("docUser").value.trim().toLowerCase();
  const p = $("docPass").value.trim();

  if (DOCTORS[u] && p === "doctor") {
    localStorage.setItem("doctorName", DOCTORS[u]);
    showDoctorDashboard();
  } else {
    $("loginError").textContent = "Invalid credentials";
  }
}

function doctorLogout() {
  localStorage.removeItem("doctorName");
  location.reload();
}

/* =================================================
   DOCTOR DASHBOARD (FETCH + FILTER)
================================================= */
async function showDoctorDashboard() {
  if ($("doctorLoginBox")) $("doctorLoginBox").style.display = "none";
  if ($("doctorDashboard")) $("doctorDashboard").style.display = "block";
  loadDoctorAppointments();
}

async function loadDoctorAppointments() {
  if (!$("doctorAppointmentCards")) return;

  const doctor = localStorage.getItem("doctorName");
  const wrap = $("doctorAppointmentCards");
  wrap.innerHTML = "<p>Loading...</p>";

  try {
    const res = await fetch(`${API}/appointments-all`);
    const data = await res.json();

    const my = data.filter(a => a.doctor === doctor);
    wrap.innerHTML = "";

    if (!my.length) {
      wrap.innerHTML = "<p>No appointments yet</p>";
      return;
    }

    my.forEach(a => {
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

/* =================================================
   PRESCRIPTIONS (PURE POST – SAME AS APPOINTMENTS)
================================================= */
async function savePrescription() {
  const patientName = $("prePatient").value.trim();
  const medicines = $("medicine").value.trim();
  const doctor = localStorage.getItem("doctorName");

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
        medicines,
        date: new Date().toLocaleDateString()
      })
    });

    if (!res.ok) throw new Error();

    alert("✅ Prescription saved");
    $("prePatient").value = "";
    $("medicine").value = "";

  } catch {
    alert("❌ Failed to save prescription");
  }
}

/* =================================================
   ADMIN LOGIN (FRONTEND ONLY)
================================================= */
function adminLogin() {
  const u = $("adminUser").value.trim();
  const p = $("adminPass").value.trim();

  if (u === "admin" && p === "admin") {
    localStorage.setItem("admin", "true");
    location.href = "admin-dashboard.html";
  } else {
    $("loginError").textContent = "Invalid admin credentials";
  }
}

function adminLogout() {
  localStorage.removeItem("admin");
  location.href = "admin-login.html";
}

/* =================================================
   ADMIN DASHBOARD (DIRECT API)
================================================= */
async function loadAdminData() {
  if (localStorage.getItem("admin") !== "true") {
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
  if ($("apt") && typeof loadAdminData === "function") {
    loadAdminData();
  }
});
