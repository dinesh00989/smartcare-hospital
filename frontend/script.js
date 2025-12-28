/*************************************************
 SMARTCARE – FINAL FULL STACK SCRIPT
 Stable • Demo Ready • Exam Safe
**************************************************/

/* ========= UTIL ========= */
function $(id) {
  return document.getElementById(id);
}

const API = "http://localhost:3000";

/* ========= DOCTOR DATA ========= */
const doctors = [
  { username: "drrao", name: "Dr. A. Rao", speciality: "General Physician" },
  { username: "drmeena", name: "Dr. Meena S.", speciality: "Pediatrician" },
  { username: "drkumar", name: "Dr. K. Kumar", speciality: "Orthopedic" },
  { username: "drsharma", name: "Dr. P. Sharma", speciality: "Cardiologist" }
];

let loggedDoctor = null;

/* ========= DOM READY ========= */
document.addEventListener("DOMContentLoaded", () => {

  /* Populate doctor dropdown */
  if ($("aptDoctor")) {
    $("aptDoctor").innerHTML = `<option value="">-- Select Doctor --</option>`;
    doctors.forEach(d => {
      const o = document.createElement("option");
      o.value = d.name;
      o.textContent = `${d.name} (${d.speciality})`;
      $("aptDoctor").appendChild(o);
    });
  }
});

/* ========= ADD APPOINTMENT ========= */
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
    .then(() => {
      alert("Appointment booked successfully");
      $("aptPatient").value = "";
      $("aptDate").value = "";
    })
    .catch(() => alert("Failed to book appointment"));
}

/* ========= DOCTOR LOGIN ========= */
function doctorLogin() {
  const username = $("docUser").value.trim().toLowerCase();
  const password = $("docPass").value.trim();

  if (!username || !password) {
    $("loginError").textContent = "Enter username and password";
    return;
  }

  fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.role === "doctor") {
        loggedDoctor = username;
        $("doctorLoginBox").style.display = "none";
        $("doctorDashboard").style.display = "block";
        loadDoctorAppointments();
      } else {
        $("loginError").textContent = "Invalid credentials";
      }
    })
    .catch(() => {
      $("loginError").textContent = "Server error";
    });
}

/* ========= LOAD DOCTOR APPOINTMENTS ========= */
function loadDoctorAppointments() {
  if (!loggedDoctor) return;

  const doctorMap = {};
  doctors.forEach(d => doctorMap[d.username] = d.name);

  fetch(`${API}/appointments`, { credentials: "include" })
    .then(res => res.json())
    .then(data => {
      const wrap = $("doctorAppointmentCards");
      wrap.innerHTML = "";

      const myAppointments = data.filter(
        a => a.doctor === doctorMap[loggedDoctor]
      );

      if (!myAppointments.length) {
        wrap.innerHTML = "<p>No appointments yet</p>";
        return;
      }

      myAppointments.forEach(a => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <b>Patient:</b> ${a.patientName}<br>
          <b>Date:</b> ${a.date}
        `;
        wrap.appendChild(card);
      });
    });
}

/* ========= LOGOUT ========= */
function doctorLogout() {
  fetch(`${API}/logout`, {
    method: "POST",
    credentials: "include"
  }).then(() => {
    loggedDoctor = null;
    location.reload();
  });
}
