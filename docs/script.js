/*************************************************
 SMARTCARE – FINAL FRONTEND SCRIPT
 Works with Render Backend + MongoDB Atlas
**************************************************/

const API = "https://smartcare-hospital.onrender.com";

/* =================================================
   APPOINTMENTS – PUBLIC BOOKING
================================================= */
async function addAppointment() {
  const patientName = document.getElementById("aptPatient").value.trim();
  const doctor = document.getElementById("aptDoctor").value;
  const date = document.getElementById("aptDate").value;

  if (!patientName || !doctor || !date) {
    alert("Fill all appointment fields");
    return;
  }

  const res = await fetch(`${API}/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ patientName, doctor, date })
  });

  if (res.ok) {
    alert("Appointment booked successfully");
    document.getElementById("appointmentForm").reset();
  } else {
    alert("Failed to book appointment");
  }
}

/* =================================================
   DOCTOR LOGIN (GLOBAL)
================================================= */
async function doctorLogin() {
  const username = docUser.value.trim().toLowerCase();
  const password = docPass.value.trim();

  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password })
  });

  if (!res.ok) {
    loginError.textContent = "Invalid credentials";
    return;
  }

  const data = await res.json();
  if (data.role !== "doctor") {
    loginError.textContent = "Not a doctor account";
    return;
  }

  localStorage.setItem("doctorLoggedIn", "true");
  localStorage.setItem("doctorUser", username);

  showDoctorDashboard();
}

/* =================================================
   DOCTOR DASHBOARD – APPOINTMENTS
================================================= */
async function showDoctorDashboard() {
  doctorLoginBox.style.display = "none";
  doctorDashboard.style.display = "block";
  loadDoctorAppointments();
}

async function loadDoctorAppointments() {
  doctorAppointmentCards.innerHTML = "";

  const res = await fetch(`${API}/appointments`, {
    credentials: "include"
  });

  if (!res.ok) {
    doctorAppointmentCards.innerHTML =
      "<p>No appointments found</p>";
    return;
  }

  const data = await res.json();

  if (!data.length) {
    doctorAppointmentCards.innerHTML =
      "<p>No appointments assigned</p>";
    return;
  }

  data.forEach(a => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h4>${a.patientName}</h4>
      <p><b>Date:</b> ${a.date}</p>
      <p><b>Doctor:</b> ${a.doctor}</p>
    `;
    doctorAppointmentCards.appendChild(div);
  });
}

function doctorLogout() {
  fetch(`${API}/logout`, {
    method: "POST",
    credentials: "include"
  }).finally(() => {
    localStorage.removeItem("doctorLoggedIn");
    localStorage.removeItem("doctorUser");
    location.reload();
  });
}

/* =================================================
   PRESCRIPTION MODULE (BACKEND CONNECTED)
================================================= */
async function doctorLoginFromPrescription() {
  const username = docUser.value.trim().toLowerCase();
  const password = docPass.value.trim();

  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password })
  });

  if (!res.ok) {
    loginError.textContent = "Invalid credentials";
    return;
  }

  localStorage.setItem("doctorLoggedIn", "true");
  localStorage.setItem("doctorUser", username);

  showPrescriptionModule(username);
}

function showPrescriptionModule(username) {
  doctorLoginBox.style.display = "none";
  prescriptionModule.style.display = "block";
  doctorNameText.textContent = username;
}

/* SAVE PRESCRIPTION */
async function savePrescription() {
  const patientName = prePatient.value.trim();
  const diagnosis = prescriptionTemplate.value;
  const medicines = medicine.value.trim();
  const doctor = localStorage.getItem("doctorUser");

  if (!patientName || !medicines) {
    alert("Fill all prescription fields");
    return;
  }

  const res = await fetch(`${API}/prescriptions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      patientName,
      doctor,
      diagnosis,
      medicines,
      date: new Date().toLocaleDateString()
    })
  });

  if (res.ok) {
    alert("Prescription saved");
    prePatient.value = "";
    medicine.value = "";
  } else {
    alert("Failed to save prescription");
  }
}

/* =================================================
   ADMIN LOGIN (SAFE + SIMPLE)
================================================= */
function adminLogin() {
  const u = adminUser.value.trim();
  const p = adminPass.value.trim();

  if (u === "admin" && p === "admin") {
    localStorage.setItem("adminLoggedIn", "true");
    location.href = "admin-dashboard.html";
  } else {
    loginError.textContent = "Invalid admin credentials";
  }
}

/* =================================================
   ADMIN DASHBOARD
================================================= */
async function loadAdminAppointments() {
  const res = await fetch(`${API}/admin/appointments`, {
    credentials: "include"
  });
  const data = await res.json();

  apt.innerHTML = `
    <tr>
      <th>Patient</th>
      <th>Doctor</th>
      <th>Date</th>
      <th>Action</th>
    </tr>`;

  data.forEach(a => {
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
}

async function loadAdminPrescriptions() {
  const res = await fetch(`${API}/admin/prescriptions`, {
    credentials: "include"
  });
  const data = await res.json();

  rx.innerHTML = `
    <tr>
      <th>Patient</th>
      <th>Doctor</th>
      <th>Diagnosis</th>
      <th>Medicines</th>
      <th>Date</th>
      <th>Action</th>
    </tr>`;

  data.forEach(p => {
    rx.innerHTML += `
      <tr>
        <td>${p.patientName}</td>
        <td>${p.doctor}</td>
        <td>${p.diagnosis}</td>
        <td>${p.medicines}</td>
        <td>${p.date}</td>
        <td>
          <button onclick="deletePrescription('${p._id}')">Delete</button>
        </td>
      </tr>`;
  });
}

async function deleteAppointment(id) {
  await fetch(`${API}/admin/appointments/${id}`, {
    method: "DELETE",
    credentials: "include"
  });
  loadAdminAppointments();
}

async function deletePrescription(id) {
  await fetch(`${API}/admin/prescriptions/${id}`, {
    method: "DELETE",
    credentials: "include"
  });
}

function adminLogout() {
  localStorage.removeItem("adminLoggedIn");
  location.href = "admin-login.html";
}

/* =================================================
   AUTO LOAD BASED ON PAGE
================================================= */
document.addEventListener("DOMContentLoaded", () => {
  if (typeof doctorDashboard !== "undefined" &&
      localStorage.getItem("doctorLoggedIn") === "true") {
    showDoctorDashboard();
  }

  if (typeof apt !== "undefined" &&
      localStorage.getItem("adminLoggedIn") === "true") {
    loadAdminAppointments();
    loadAdminPrescriptions();
  }
});
