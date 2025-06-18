// script.js
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
let current = new Date(2025, 0);
const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

const monthYearEl = document.getElementById('monthYear');
const daysEl = document.getElementById('calendarDays');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTask');
const taskList = document.getElementById('taskList');
const bgVideo = document.getElementById('bgVideo');

function setSeasonClass(month) {
  document.body.classList.remove('winter', 'spring', 'summer', 'autumn');

  if ([11, 0, 1].includes(month)) {
    document.body.classList.add('winter');
    bgVideo.src = 'winter.mp4';
  } else if ([2, 3, 4].includes(month)) {
    document.body.classList.add('spring');
    bgVideo.src = 'spring.mp4';
  } else if ([5, 6, 7].includes(month)) {
    document.body.classList.add('summer');
    bgVideo.src = 'summer.mp4';
  } else {
    document.body.classList.add('autumn');
    bgVideo.src = 'autumn.mp4';
  }
  bgVideo.load();
}

function renderCalendar() {
  monthYearEl.textContent = `${monthNames[current.getMonth()]} ${current.getFullYear()}`;
  daysEl.innerHTML = '';
  const firstDay = new Date(current.getFullYear(), current.getMonth(), 1).getDay();
  const totalDays = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) daysEl.appendChild(document.createElement('div'));

  for (let day = 1; day <= totalDays; day++) {
    const cell = document.createElement('div');
    cell.textContent = day;
    cell.classList.add('day');

    const now = new Date();
    if (now.getFullYear() === current.getFullYear() &&
        now.getMonth() === current.getMonth() &&
        now.getDate() === day) {
      cell.classList.add('today');
    }

    const dateKey = `${current.getFullYear()}-${current.getMonth()}-${day}`;
    if (tasks.some(t => t.date === dateKey)) cell.classList.add('marked');

    cell.addEventListener('click', () => {
      taskInput.dataset.date = dateKey;
      taskInput.placeholder = `Task for ${monthNames[current.getMonth()]} ${day}`;
      taskInput.focus();
    });

    daysEl.appendChild(cell);
  }

  setSeasonClass(current.getMonth());
}

function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach((t, i) => {
    const li = document.createElement('li');
    li.textContent = `${t.date.split('-').slice(1).join('/')} - ${t.text}`;
    const del = document.createElement('button');
    del.textContent = '✕';
    del.addEventListener('click', () => {
      tasks.splice(i, 1);
      saveAndRender();
    });
    li.appendChild(del);
    taskList.appendChild(li);
  });
}

function saveAndRender() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderCalendar();
  renderTasks();
}

prevBtn.addEventListener('click', () => {
  current.setMonth(current.getMonth() - 1);
  saveAndRender();
});
nextBtn.addEventListener('click', () => {
  current.setMonth(current.getMonth() + 1);
  saveAndRender();
});
addTaskBtn.addEventListener('click', () => {
  const text = taskInput.value.trim();
  const date = taskInput.dataset.date;
  if (!text || !date) return;
  tasks.push({ date, text });
  taskInput.value = '';
  taskInput.removeAttribute('data-date');
  taskInput.placeholder = 'Add a task and pick a date';
  saveAndRender();
});

saveAndRender();
