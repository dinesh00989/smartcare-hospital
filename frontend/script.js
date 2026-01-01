/*************************************************
 SMARTCARE – FINAL FULL STACK SCRIPT
 Backend-Enforced • DB Verified • Exam Safe
**************************************************/

/* ========= UTIL ========= */
function $(id) {
  return document.getElementById(id);
}

/* ========= BACKEND BASE URL ========= */
const API = "https://smartcare-hospital.onrender.com";

/* ========= DOCTOR MASTER DATA ========= */
const doctors = [
  { username: "drrao", name: "Dr. A. Rao", speciality: "General Physician" },
  { username: "drmeena", name: "Dr. Meena S.", speciality: "Pediatrician" },
  { username: "drkumar", name: "Dr. K. Kumar", speciality: "Orthopedic" },
  { username: "drsharma", name: "Dr. P. Sharma", speciality: "Cardiologist" }
];

const doctorMap = {
  drrao: "Dr. A. Rao",
  drmeena: "Dr. Meena S.",
  drkumar: "Dr. K. Kumar",
  drsharma: "Dr. P. Sharma"
};

/* ========= DOM READY ========= */
document.addEventListener("DOMContentLoaded", () => {
  if ($("aptDoctor")) {
    $("aptDoctor").innerHTML = `<option value="">-- Select Doctor --</option>`;
    doctors.forEach(d => {
      const o = document.createElement("option");
      o.value = d.name;
      o.textContent = `${d.name} (${d.speciality})`;
      $("aptDoctor").appendChild(o);
    });
  }

  if ($("doctorAppointmentCards")) {
    loadDoctorAppointments();
  }
});

/* =====================================================
   APPOINTMENTS – ALWAYS BACKEND + DB
===================================================== */
function addAppointment() {
  const patientName = $("aptPatient")?.value.trim();
  const doctor = $("aptDoctor")?.value;
  const date = $("aptDate")?.value;

  if (!patientName || !doctor || !date) {
    alert("Please fill all fields");
    return;
  }

  fetch(`${API}/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ patientName, doctor, date })
  })
    .then(res => {
      if (!res.ok) throw new Error("Backend rejected appointment");
      return res.json();
    })
    .then(data => {
      console.log("✅ Appointment saved in DB:", data);
      alert("✅ Appointment booked and stored in database");
      $("aptPatient").value = "";
      $("aptDate").value = "";
    })
    .catch(err => {
      console.error("❌ Appointment error:", err);
      alert("❌ Backend error. Appointment NOT saved.");
    });
}

/* =====================================================
   DOCTOR LOGIN
===================================================== */
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
    .then(res => {
      if (!res.ok) throw new Error("Login failed");
      return res.json();
    })
    .then(data => {
      if (data.role !== "doctor") {
        $("loginError").textContent = "Access denied";
        return;
      }

      if ($("doctorLoginBox")) $("doctorLoginBox").style.display = "none";
      if ($("doctorDashboard")) $("doctorDashboard").style.display = "block";
      if ($("prescriptionBox")) $("prescriptionBox").style.display = "flex";

      if ($("pDoctor")) $("pDoctor").value = doctorMap[username];

      loadDoctorAppointments();
    })
    .catch(() => {
      $("loginError").textContent = "Invalid credentials";
    });
}

/* =====================================================
   LOAD DOCTOR APPOINTMENTS (FROM DB)
===================================================== */
function loadDoctorAppointments() {
  if (!$("doctorAppointmentCards")) return;

  fetch(`${API}/appointments`, { credentials: "include" })
    .then(res => {
      if (!res.ok) throw new Error("Not authorized");
      return res.json();
    })
    .then(data => {
      const wrap = $("doctorAppointmentCards");
      wrap.innerHTML = "";

      if (!data.length) {
        wrap.innerHTML = "<p>No appointments in database</p>";
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
    .catch(err => {
      console.error("❌ Load appointments failed:", err);
    });
}

/* =====================================================
   SAVE PRESCRIPTION – ALWAYS DB
===================================================== */
function savePrescription() {
  fetch(`${API}/prescriptions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      patientName: pPatient.value,
      doctor: pDoctor.value,
      diagnosis: pDiagnosis.value,
      medicines: pMedicines.value,
      notes: pNotes.value,
      date: new Date().toLocaleDateString()
    })
  })
    .then(res => {
      if (!res.ok) throw new Error("Prescription failed");
      return res.json();
    })
    .then(data => {
      console.log("✅ Prescription saved:", data);
      alert("✅ Prescription stored in database");
    })
    .catch(() => alert("❌ Prescription not saved"));
}

/* =====================================================
   LOGOUT
===================================================== */
function doctorLogout() {
  fetch(`${API}/logout`, {
    method: "POST",
    credentials: "include"
  }).then(() => location.reload());
}
