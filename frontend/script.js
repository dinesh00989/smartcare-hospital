/*************************************************
 SMARTCARE – FINAL FULL STACK SCRIPT
 Stable • Demo Ready • Exam Safe • Production Safe
**************************************************/

/* ========= UTIL ========= */
function $(id) {
  return document.getElementById(id);
}

/* ========= BACKEND BASE URL ========= */
/* ❌ NO TRAILING SLASH */
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

  /* Populate doctor dropdown (appointments page) */
  if ($("aptDoctor")) {
    $("aptDoctor").innerHTML = `<option value="">-- Select Doctor --</option>`;
    doctors.forEach(d => {
      const o = document.createElement("option");
      o.value = d.name;
      o.textContent = `${d.name} (${d.speciality})`;
      $("aptDoctor").appendChild(o);
    });
  }

  /* Load doctor appointments only if dashboard exists */
  if ($("doctorAppointmentCards")) {
    loadDoctorAppointments();
  }
});

/* =====================================================
   APPOINTMENTS – PUBLIC (NO LOGIN REQUIRED)
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
    body: JSON.stringify({ patientName, doctor, date })
  })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(() => {
      alert("✅ Appointment booked successfully");
      $("aptPatient").value = "";
      $("aptDate").value = "";
    })
    .catch(() => {
      alert("❌ Server error while booking appointment");
    });
}

/* =====================================================
   DOCTOR LOGIN (USED BY DOCTOR + PRESCRIPTION)
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
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(data => {
      if (data.role !== "doctor") {
        $("loginError").textContent = "Access denied";
        return;
      }

      /* Hide login, show dashboard/prescription */
      if ($("doctorLoginBox")) $("doctorLoginBox").style.display = "none";
      if ($("doctorDashboard")) $("doctorDashboard").style.display = "block";
      if ($("prescriptionBox")) $("prescriptionBox").style.display = "flex";

      /* Auto-fill doctor name in prescription */
      if ($("pDoctor")) {
        $("pDoctor").value = doctorMap[username];
      }

      loadDoctorAppointments();
    })
    .catch(() => {
      $("loginError").textContent = "Invalid credentials";
    });
}

/* =====================================================
   LOAD DOCTOR APPOINTMENTS (PROTECTED)
===================================================== */
function loadDoctorAppointments() {
  if (!$("doctorAppointmentCards")) return;

  fetch(`${API}/appointments`, {
    credentials: "include"
  })
    .then(res => {
      if (res.status === 401) {
        $("doctorAppointmentCards").innerHTML =
          "<p>Please login to view appointments</p>";
        throw new Error();
      }
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
   PRESCRIPTION LOGIC
===================================================== */
function applyTemplate(t) {
  if (t === "fever") {
    pDiagnosis.value = "Fever";
    pMedicines.value = "Paracetamol 650mg – twice daily";
    pNotes.value = "Drink fluids & take rest";
  }
  if (t === "cold") {
    pDiagnosis.value = "Cold & Cough";
    pMedicines.value = "Cetirizine, Cough syrup";
    pNotes.value = "Avoid cold items";
  }
  if (t === "gastric") {
    pDiagnosis.value = "Gastric Issue";
    pMedicines.value = "Omeprazole";
    pNotes.value = "Avoid spicy food";
  }
  if (t === "bp") {
    pDiagnosis.value = "Blood Pressure";
    pMedicines.value = "Amlodipine";
    pNotes.value = "Monitor BP regularly";
  }
  updatePreview();
}

function updatePreview() {
  if (!$("previewBox")) return;

  previewBox.innerHTML = `
    <div class="rx">℞</div>
    <p><b>Patient:</b> ${pPatient.value || "—"}</p>
    <p><b>Doctor:</b> ${pDoctor.value || "—"}</p>
    <p><b>Diagnosis:</b> ${pDiagnosis.value || "—"}</p>
    <p><b>Medicines:</b><br>${pMedicines.value || "—"}</p>
    <p><b>Advice:</b><br>${pNotes.value || "—"}</p>
  `;
}

function savePrescription() {
  if (!pPatient.value || !pDoctor.value || !pDiagnosis.value || !pMedicines.value) {
    alert("Fill all required fields");
    return;
  }

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
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(() => {
      alert("✅ Prescription saved successfully");
      document.querySelectorAll("input, textarea").forEach(i => i.value = "");
      updatePreview();
    })
    .catch(() => alert("❌ Failed to save prescription"));
}

/* =====================================================
   LOGOUT
===================================================== */
function doctorLogout() {
  fetch(`${API}/logout`, {
    method: "POST",
    credentials: "include"
  }).then(() => {
    location.reload();
  });
}
