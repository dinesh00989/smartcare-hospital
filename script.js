/*************************************************
 SMARTCARE – FINAL STABLE MASTER SCRIPT
 Doctors | Appointments | Login | Panels
**************************************************/

/* ========= UTIL ========= */
function $(id) {
  return document.getElementById(id);
}

/* ========= DOCTOR DATA ========= */
const doctors = [
  {
    name: "Dr. A. Rao",
    speciality: "General Physician",
    exp: "18+ Years",
    qual: "MBBS, MD",
    lang: "English, Telugu",
    status: "Available",
    photo: "https://i.pravatar.cc/150?img=12",
    expertise: ["Preventive Care", "Chronic Illness"],
    stats: ["12,000+ patients", "96% success rate"]
  },
  {
    name: "Dr. Meena S.",
    speciality: "Pediatrician",
    exp: "14+ Years",
    qual: "MBBS, MD",
    lang: "English, Telugu",
    status: "Available",
    photo: "https://i.pravatar.cc/150?img=32",
    expertise: ["Child Care", "Vaccination"],
    stats: ["9,000+ children treated"]
  },
  {
    name: "Dr. K. Kumar",
    speciality: "Orthopedic",
    exp: "16+ Years",
    qual: "MBBS, MS",
    lang: "English, Hindi",
    status: "Limited",
    photo: "https://i.pravatar.cc/150?img=56",
    expertise: ["Joint Replacement", "Fracture Care"],
    stats: ["2,000+ surgeries"]
  },
  {
    name: "Dr. P. Sharma",
    speciality: "Cardiologist",
    exp: "20+ Years",
    qual: "MBBS, DM",
    lang: "English, Hindi",
    status: "Available",
    photo: "https://i.pravatar.cc/150?img=68",
    expertise: ["Heart Disease", "Angioplasty"],
    stats: ["4,500+ procedures"]
  }
];

/* ========= ACCOUNTS ========= */
const doctorAccounts = {
  drrao: "Dr. A. Rao",
  drmeena: "Dr. Meena S.",
  drkumar: "Dr. K. Kumar",
  drsharma: "Dr. P. Sharma"
};

/* ========= STORAGE ========= */
function getAppointments() {
  return JSON.parse(localStorage.getItem("appointments")) || [];
}

function saveAppointments(data) {
  localStorage.setItem("appointments", JSON.stringify(data));
}

/* ========= DOM READY ========= */
document.addEventListener("DOMContentLoaded", () => {

  /* Doctor list */
  if ($("doctorList")) {
    renderDoctors(doctors);

    $("doctorSearch")?.addEventListener("input", e => {
      const q = e.target.value.toLowerCase();
      renderDoctors(
        doctors.filter(d =>
          d.name.toLowerCase().includes(q) ||
          d.speciality.toLowerCase().includes(q)
        )
      );
    });
  }

  /* Appointment dropdown */
  if ($("aptDoctor")) {
    $("aptDoctor").innerHTML = `<option value="">-- Select Doctor --</option>`;
    doctors.forEach(d => {
      const o = document.createElement("option");
      o.value = d.name;
      o.textContent = `${d.name} (${d.speciality})`;
      $("aptDoctor").appendChild(o);
    });
  }

  /* Auto doctor session restore */
  if (localStorage.getItem("doctorName") && $("doctorDashboard")) {
    loadDoctorAppointments();
  }
});

/* ========= RENDER DOCTORS ========= */
function renderDoctors(data) {
  const list = $("doctorList");
  if (!list) return;

  list.innerHTML = "";
  data.forEach(d => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${d.name}</strong><br><span>${d.speciality}</span>`;
    li.onclick = () => openDoctorPanel(d);
    list.appendChild(li);
  });
}

/* ========= DOCTOR PANEL ========= */
function openDoctorPanel(d) {
  if (!$("doctorPanel")) return;

  $("doctorPanel").classList.add("open");
  $("panelPhoto").src = d.photo;
  $("panelName").textContent = d.name;
  $("panelSpec").textContent = d.speciality;
  $("panelExp").textContent = d.exp;
  $("panelQual").textContent = d.qual;
  $("panelLang").textContent = d.lang;

  $("panelStatus").textContent = d.status;
  $("panelStatus").className = `status-badge status-${d.status}`;

  $("panelExpertise").innerHTML = d.expertise.map(e => `<li>${e}</li>`).join("");
  $("panelStats").innerHTML = d.stats.map(s => `<li>${s}</li>`).join("");
}

function closeDoctorPanel() {
  $("doctorPanel")?.classList.remove("open");
}

/* ========= APPOINTMENTS ========= */
function addAppointment() {
  const patient = $("aptPatient").value.trim();
  const doctor = $("aptDoctor").value;
  const date = $("aptDate").value;

  if (!patient || !doctor || !date) {
    alert("Please fill all fields");
    return;
  }

  const appointments = getAppointments();

  const exists = appointments.some(
    a => a.patient === patient && a.doctor === doctor && a.date === date
  );

  if (exists) {
    alert("Appointment already exists for this patient and date");
    return;
  }

  appointments.push({ patient, doctor, date });
  saveAppointments(appointments);

  alert("Appointment booked successfully");
  $("aptPatient").value = "";
  $("aptDate").value = "";
}

/* ========= DOCTOR LOGIN ========= */
function doctorLogin() {
  const u = $("docUser").value.toLowerCase().trim();
  const p = $("docPass").value.trim();

  if (doctorAccounts[u] && p === "doctor") {
    localStorage.setItem("doctorName", doctorAccounts[u]);
    $("loginError") && ($("loginError").textContent = "");
    loadDoctorAppointments();
  } else {
    $("loginError") && ($("loginError").textContent = "Invalid credentials");
  }
}

/* ========= LOGOUT ========= */
function doctorLogout() {
  localStorage.removeItem("doctorName");
  location.reload();
}

/* ========= DOCTOR DASHBOARD ========= */
function loadDoctorAppointments() {
  const name = localStorage.getItem("doctorName");
  if (!name || !$("doctorDashboard")) return;

  $("doctorDashboard").style.display = "block";
  $("doctorLoginBox") && ($("doctorLoginBox").style.display = "none");

  const appointments = getAppointments();
  const my = appointments.filter(a => a.doctor === name);
  const wrap = $("doctorAppointmentCards");
  wrap.innerHTML = "";

  if (!my.length) {
    wrap.innerHTML = "<p>No appointments yet</p>";
    return;
  }

  my.forEach(a => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<b>${a.patient}</b><br>Date: ${a.date}`;
    wrap.appendChild(card);
  });
}
