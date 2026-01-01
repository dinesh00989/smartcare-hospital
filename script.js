/*************************************************
 SMARTCARE – FINAL BACKEND CONNECTED SCRIPT
 Appointments | Doctor Login | Dashboard
**************************************************/

/* ========= UTIL ========= */
function $(id) {
  return document.getElementById(id);
}

/* ========= BACKEND URL ========= */
const API = "https://smartcare-hospital.onrender.com";

/* =====================================================
   APPOINTMENTS (BACKEND + ATLAS)
===================================================== */
function addAppointment() {
  const patientName = $("aptPatient").value.trim();
  const doctor = $("aptDoctor").value;
  const date = $("aptDate").value;

  if (!patientName || !doctor || !date) {
    alert("Please fill all fields");
    return;
  }

  fetch(`${API}/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ patientName, doctor, date })
  })
    .then(res => res.json())
    .then(data => {
      alert("✅ Appointment saved in database");
      $("aptPatient").value = "";
      $("aptDate").value = "";
      console.log("Saved:", data);
    })
    .catch(err => {
      console.error(err);
      alert("❌ Failed to save appointment");
    });
}

/* =====================================================
   DOCTOR LOGIN (BACKEND SESSION)
===================================================== */
function doctorLogin() {
  const username = $("docUser").value.trim().toLowerCase();
  const password = $("docPass").value.trim();

  fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password })
  })
    .then(res => {
      if (!res.ok) throw new Error("Login failed");
      return res.json();
    })
    .then(() => {
      location.href = "prescription.html";
    })
    .catch(() => {
      $("loginError").textContent = "Invalid credentials";
    });
}

/* =====================================================
   LOAD DOCTOR APPOINTMENTS (BACKEND)
===================================================== */
function loadDoctorAppointments() {
  fetch(`${API}/appointments`, {
    credentials: "include"
  })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(data => {
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
    })
    .catch(() => {});
}

/* =====================================================
   LOGOUT
===================================================== */
function doctorLogout() {
  fetch(`${API}/logout`, {
    method: "POST",
    credentials: "include"
  }).then(() => location.href = "index.html");
}
