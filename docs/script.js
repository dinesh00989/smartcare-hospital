/*************************************************
 SMARTCARE – FINAL FRONTEND MASTER SCRIPT
 Doctors • Appointments • Prescriptions • Admin
**************************************************/

/* ========= CONFIG ========= */
const API = "https://smartcare-hospital.onrender.com";

/* ========= UTIL ========= */
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

    alert("✅ Appointment booked");
    $("aptPatient").value = "";
    $("aptDate").value = "";
    $("aptDoctor").value = "";

  } catch {
    alert("❌ Failed to book appointment");
  }
}

/* =================================================
   DOCTOR LOGIN (GLOBAL)
================================================= */
async function doctorLogin() {
  const username = $("docUser").value.trim().toLowerCase();
  const password = $("docPass").value.trim();

  if (!username || !password) {
    $("loginError").textContent = "Enter credentials";
    return;
  }

  try {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) throw new Error();

    const data = await res.json();
    if (data.role !== "doctor") throw new Error();

    localStorage.setItem("doctorUser", username);
    showDoctorDashboard();

  } catch {
    $("loginError").textContent = "Invalid login";
  }
}

/* =================================================
   DOCTOR DASHBOARD
================================================= */
async function showDoctorDashboard() {
  if ($("doctorLoginBox")) $("doctorLoginBox").style.display = "none";
  if ($("doctorDashboard")) $("doctorDashboard").style.display = "block";
  loadDoctorAppointments();
}

async function loadDoctorAppointments() {
  if (!$("doctorAppointmentCards")) return;

  try {
    const res = await fetch(`${API}/appointments`, {
      credentials: "include"
    });

    if (!res.ok) throw new Error();

    const data = await res.json();
    const wrap = $("doctorAppointmentCards");
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
    $("doctorAppointmentCards").innerHTML =
      "<p>Login required</p>";
  }
}

/* =================================================
   DOCTOR LOGOUT
================================================= */
async function doctorLogout() {
  await fetch(`${API}/logout`, {
    method: "POST",
    credentials: "include"
  });

  localStorage.removeItem("doctorUser");
  location.reload();
}

/* =================================================
   PRESCRIPTIONS (DOCTOR)
================================================= */
async function savePrescription() {
  const patientName = $("prePatient").value.trim();
  const medicines = $("medicine").value.trim();
  const doctor = localStorage.getItem("doctorUser");

  if (!patientName || !medicines) {
    alert("Fill all fields");
    return;
  }

  try {
    const res = await fetch(`${API}/prescriptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
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
    alert("❌ Login required or error saving prescription");
  }
}

/* =================================================
   ADMIN (FRONTEND SAFE)
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
   ADMIN DASHBOARD DATA
================================================= */
async function loadAdminData() {
  if (localStorage.getItem("adminLoggedIn") !== "true") {
    location.href = "admin-login.html";
    return;
  }

  /* Appointments */
  fetch(`${API}/admin/appointments`, { credentials: "include" })
    .then(r => r.json())
    .then(d => {
      d.forEach(a => {
        apt.innerHTML += `
          <tr>
            <td>${a.patientName}</td>
            <td>${a.doctor}</td>
            <td>${a.date}</td>
            <td>
              <button onclick="deleteAppointment('${a._id}')">Delete</button>
            </td>
          </tr>`;
      });
    });

  /* Prescriptions */
  fetch(`${API}/admin/prescriptions`, { credentials: "include" })
    .then(r => r.json())
    .then(d => {
      d.forEach(p => {
        rx.innerHTML += `
          <tr>
            <td>${p.patientName}</td>
            <td>${p.doctor}</td>
            <td>${p.medicines}</td>
            <td>${p.date}</td>
            <td>
              <button onclick="deletePrescription('${p._id}')">Delete</button>
            </td>
          </tr>`;
      });
    });
}

function deleteAppointment(id) {
  fetch(`${API}/admin/appointments/${id}`, {
    method: "DELETE",
    credentials: "include"
  }).then(() => location.reload());
}

function deletePrescription(id) {
  fetch(`${API}/admin/prescriptions/${id}`, {
    method: "DELETE",
    credentials: "include"
  }).then(() => location.reload());
}

/* =================================================
   AUTO INIT
================================================= */
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("doctorUser") && $("doctorDashboard")) {
    showDoctorDashboard();
  }

  if (typeof loadAdminData === "function" && $("apt")) {
    loadAdminData();
  }
});
