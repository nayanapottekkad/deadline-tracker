const calendar = document.getElementById("calendar");
const monthTitle = document.getElementById("monthTitle");

let currentDate = new Date();

function generateCalendar() {
  if (!calendar) return;

  calendar.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  monthTitle.innerText =
    currentDate.toLocaleString("default", { month: "long" }) +
    " " +
    year;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    calendar.innerHTML += "<div></div>";
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const div = document.createElement("div");
    div.className = "day";
    div.id = `day-${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    div.innerHTML = `<strong>${day}</strong>`;
    calendar.appendChild(div);
  }

  loadDeadlines();
}

function changeMonth(direction) {
  currentDate.setMonth(currentDate.getMonth() + direction);
  generateCalendar();
}

function loadDeadlines() {
  fetch("/deadlines")
    .then(res => res.json())
    .then(data => {
      data.forEach(item => {
        const d = new Date(item.datetime);

        const id = `day-${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
        const box = document.getElementById(id);

        if (box) {
          const taskDiv = document.createElement("div");
          taskDiv.className = `task ${item.subject}`;

          taskDiv.innerHTML =
            `${item.task}<br>` +
            `${d.getHours().toString().padStart(2,'0')}:` +
            `${d.getMinutes().toString().padStart(2,'0')}`;

          if (window.location.pathname.includes("editor")) {
            taskDiv.onclick = () => deleteTask(item.id);
          }

          box.appendChild(taskDiv);
        }
      });
    });
}

function addTask() {
  const subject = document.getElementById("subject").value;
  const task = document.getElementById("task").value;
  const datetime = document.getElementById("datetime").value;

  if (!task || !datetime) {
    alert("Fill all fields");
    return;
  }

  fetch("/deadlines", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subject, task, datetime })
  })
  .then(() => generateCalendar());
}

function deleteTask(id) {
  fetch(`/deadlines/${id}`, { method: "DELETE" })
    .then(() => generateCalendar());
}

// 2 hour reminder
let remindedTasks = new Set();

function checkReminder() {
  fetch("/deadlines")
    .then(res => res.json())
    .then(data => {
      const now = new Date();

      data.forEach(item => {
        const deadline = new Date(item.datetime);
        const diff = (deadline - now) / (1000 * 60);

        if (diff <= 120 && diff > 119) {
          if (!remindedTasks.has(item.id)) {
            remindedTasks.add(item.id);
            alert(`Reminder: ${item.task} due in 2 hours!`);
          }
        }
      });
    });
}

setInterval(checkReminder, 60000);

generateCalendar();
