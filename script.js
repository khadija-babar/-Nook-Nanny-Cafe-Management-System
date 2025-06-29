// Check for localStorage support
if (typeof(Storage) === "undefined") {
  alert("LocalStorage is not available in your browser. Some features may not work properly.");
}

// User system with all roles
const users = {
  "manager": { password: "manager123", role: "manager" },
  "barista": { password: "barista123", role: "barista" },
  "cook": { password: "cook123", role: "cook" },
  "kitchenhelper": { password: "helper123", role: "kitchenhelper" },
  "cleaner": { password: "cleaner123", role: "cleaner" },
  "receptionist": { password: "reception123", role: "receptionist" },
  "nanny": { password: "nanny123", role: "nanny" }
};

let currentUser = null;

// Login elements
const loginOverlay = document.getElementById('loginOverlay');
const usernameInput = document.getElementById('usernameInput');
const passwordInput = document.getElementById('passwordInput');
const loginBtn = document.getElementById('loginBtn');
const loginMessage = document.getElementById('loginMessage');
const logoutBtn = document.getElementById('logoutBtn');
const userInfoDisplay = document.getElementById('userInfoDisplay');

// Calendar elements
const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
let current = new Date();
let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
let logs = JSON.parse(localStorage.getItem('logs') || '{}');

// Staff and attendance constants
const staff = ["Manager", "Barista", "Cook", "KitchenHelper", "Cleaner", "Receptionist", "Nanny"];
const ABSENCE_DEDUCTION = 1000;

// Salary information
const salaries = {
  Manager: 50000,
  Barista: 15000,
  Cook: 20000,
  KitchenHelper: 10000,
  Cleaner: 20000,
  Receptionist: 10000,
  Nanny: 2000 // per child
};

// Menu items
const drinkItems = [
  { name: "Coffee", price: 300 },
  { name: "Tea", price: 200 },
  { name: "Smoothie", price: 400 }
];

const foodItems = [
  { name: "Sandwich", price: 500 },
  { name: "Cake", price: 350 },
  { name: "Pasta", price: 600 }
];

// DOM Elements
const monthYearEl = document.getElementById('monthYear');
const daysEl = document.getElementById('calendarDays');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTask');
const deleteTaskBtn = document.getElementById('deleteTask');
const taskMessage = document.getElementById('taskMessage');

const dailyLog = document.getElementById('dailyLog');
const logDate = document.getElementById('logDate');
const logKids = document.getElementById('logKids');
const logExpenses = document.getElementById('logExpenses');
const drinksMenu = document.getElementById('drinksMenu');
const foodMenu = document.getElementById('foodMenu');
const attendanceSection = document.getElementById('attendanceSection');
const saveLogBtn = document.getElementById('saveLog');
const backBtn = document.getElementById('backBtn');
const logSummary = document.getElementById('logSummary');
const editLogBtn = document.getElementById('editLog');

const summaryBox = document.getElementById('monthlySummary');
const closeSummaryBtn = document.getElementById('closeSummary');
const backFromSummaryBtn = document.getElementById('backFromSummary');
const summaryContent = document.getElementById('summaryContent');
const showSummaryBtn = document.getElementById('showSummary');

const bgVideo = document.getElementById('bgVideo');

// Role-specific sections
const nannySection = document.getElementById('nannySection');
const baristaSection = document.getElementById('baristaSection');
const kitchenSection = document.getElementById('kitchenSection');
const managerSection = document.getElementById('managerSection');

// Login function
function login()  {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();
  
  if (!username || !password) {
    loginMessage.textContent = "Please enter both username and password";
    return;
  }
  
  if (users[username] && users[username].password === password) {
    currentUser = {
      username: username,
      role: users[username].role
    };
    
    loginOverlay.style.display = 'none';
    updateUIForUserRole();
    renderCalendar();
    
    // Show user info and logout button for all users
    userInfoDisplay.style.display = 'block';
    userInfoDisplay.textContent = `Logged in as: ${username} (${users[username].role})`;
    logoutBtn.style.display = 'inline';
  } else {
    loginMessage.textContent = "Invalid username or password";
  }
};

// Logout function
logoutBtn.onclick = function() {
  currentUser = null;
  loginOverlay.style.display = 'flex';
  logoutBtn.style.display = 'none';
  userInfoDisplay.style.display = 'none';
  document.querySelector('.container').classList.add('view-only');
  
  // Clear inputs
  usernameInput.value = '';
  passwordInput.value = '';
  loginMessage.textContent = '';
  taskInput.value = '';
  taskMessage.textContent = '';
};

// Update UI based on user role
function updateUIForUserRole() {
  const isManager = currentUser.role === "manager";
  const container = document.querySelector('.container');
  
  // Hide all role sections first
  nannySection.style.display = 'none';
  baristaSection.style.display = 'none';
  kitchenSection.style.display = 'none';
  managerSection.style.display = 'none';
  
  if (!isManager) {
    container.classList.add('view-only');
    taskInput.readOnly = true;
    addTaskBtn.style.display = 'none';
    deleteTaskBtn.style.display = 'none';
    
    // Show relevant section based on role
    switch(currentUser.role) {
      case "nanny":
        nannySection.style.display = 'block';
        break;
      case "barista":
        baristaSection.style.display = 'block';
        break;
      case "cook":
      case "kitchenhelper":
        kitchenSection.style.display = 'block';
        break;
    }
  } else {
    container.classList.remove('view-only');
    taskInput.readOnly = false;
    addTaskBtn.style.display = 'inline';
    deleteTaskBtn.style.display = 'inline';
    managerSection.style.display = 'block';
  }
}

// Apply season video
function setSeasonClass(m) {
  document.body.classList.remove('winter','spring','summer','autumn');
  const seasons = {
    winter: [11,0,1], spring: [2,3,4],
    summer: [5,6,7], autumn: [8,9,10]
  };
  for (let s in seasons) {
    if (seasons[s].includes(m)) {
      document.body.classList.add(s);
      bgVideo.src = `assets/videos/${s}.mp4`;
    }
  }
  bgVideo.load();
}

// Build calendar
function renderCalendar() {
  if (!currentUser) return; // Don't render until logged in
  
  const y = current.getFullYear(), m = current.getMonth();
  monthYearEl.textContent = `${monthNames[m]} ${y}`;
  daysEl.innerHTML = "";

  const firstDow = new Date(y,m,1).getDay();
  const daysInM = new Date(y,m+1,0).getDate();
  for (let i=0;i<firstDow;i++) daysEl.appendChild(document.createElement('div'));

  for (let d=1;d<=daysInM;d++) {
    const cell = document.createElement('div');
    const key = `${y}-${m}-${d}`;
    cell.textContent = d;
    cell.className = 'day';
    const today = new Date();
    if (today.getFullYear()===y && today.getMonth()===m && today.getDate()===d) {
      cell.classList.add('today');
    }
    const T = tasks.find(t=>t.date===key);
    if (T) cell.classList.add('marked');

    cell.onclick = ()=> {
      if (T) {
        // show existing task
        taskMessage.textContent = `📝 ${T.text}`;
        if (currentUser.role === "manager") {
          taskInput.style.display = addTaskBtn.style.display = deleteTaskBtn.style.display = 'inline';
          taskInput.dataset.date = key;
          taskInput.value = T.text;
        }
      } else {
        promptMenu(key,m,d);
      }
    };
    daysEl.appendChild(cell);
  }
  setSeasonClass(current.getMonth());
}

// Options menu
function promptMenu(key,mName,d) {
  if (currentUser.role !== "manager") {
    taskMessage.textContent = "Only managers can add/edit content";
    return;
  }
  
  const opt = prompt("1 Add Task\n2 Delete Task\n3 Daily Report");
  if (opt==='1') {
    taskInput.style.display = addTaskBtn.style.display = 'inline';
    taskInput.dataset.date = key;
    taskInput.placeholder = `Task for ${monthNames[mName]} ${d}`;
    taskInput.value = '';
    taskMessage.textContent = '';
  } else if (opt==='2') {
    tasks = tasks.filter(t=>t.date!==key);
    saveAll();
  } else if (opt==='3') {
    openLog(key);
  }
}

// Open daily-log overlay
function openLog(key) {
  if (!logs[key] && currentUser.role !== "manager") {
    taskMessage.textContent = "No log available for this date";
    return;
  }
  
  dailyLog.style.display = 'flex';
  logDate.textContent = `Log for ${key}`;
  logDate.dataset.key = key;
  
  // Reset all fields
  logKids.value = '';
  logExpenses.value = '';
  drinksMenu.innerHTML = '';
  foodMenu.innerHTML = '';
  attendanceSection.innerHTML = '';
  logSummary.textContent = '';

  // Show relevant sections based on role
  nannySection.style.display = 'none';
  baristaSection.style.display = 'none';
  kitchenSection.style.display = 'none';
  managerSection.style.display = 'none';

  // Always show attendance for all roles
  attendanceSection.innerHTML = `
    <h3>Your Attendance</h3>
    <label>
      ${currentUser.role}:
      <select class="attendance-select" data-role="${currentUser.role}" ${currentUser.role !== "manager" ? 'disabled' : ''}>
        <option value="present">Present</option>
        <option value="absent">Absent (-PKR ${ABSENCE_DEDUCTION})</option>
        <option value="leave">On Leave</option>
      </select>
    </label>
  `;

  // Show role-specific sections
  switch(currentUser.role) {
    case "manager":
      managerSection.style.display = 'block';
      nannySection.style.display = 'block';
      baristaSection.style.display = 'block';
      kitchenSection.style.display = 'block';
      
      // Create full attendance section
      attendanceSection.innerHTML = `
        <h3>Staff Attendance</h3>
        ${staff.map(role => `
          <label>
            ${role}:
            <select class="attendance-select" data-role="${role}">
              <option value="present">Present</option>
              <option value="absent">Absent (-PKR ${ABSENCE_DEDUCTION})</option>
              <option value="leave">On Leave</option>
            </select>
          </label>
        `).join('')}
      `;

      // Create drink items inputs
      drinkItems.forEach(i => {
        drinksMenu.innerHTML += `
          <label>
            ${i.name} 
            <input 
              data-name="${i.name}" 
              data-price="${i.price}" 
              type="number" 
              min="0" 
              value="0"
              class="drink-input"
            />
          </label>
        `;
      });

      // Create food items inputs
      foodItems.forEach(i => {
        foodMenu.innerHTML += `
          <label>
            ${i.name} 
            <input 
              data-name="${i.name}" 
              data-price="${i.price}" 
              type="number" 
              min="0" 
              value="0"
              class="food-input"
            />
          </label>
        `;
      });
      break;
      
    case "barista":
      baristaSection.style.display = 'block';
      drinkItems.forEach(i => {
        drinksMenu.innerHTML += `
          <label>
            ${i.name} Sold: 
            <input 
              data-name="${i.name}" 
              data-price="${i.price}" 
              type="number" 
              min="0" 
              value="0"
              class="drink-input"
              readonly
            />
          </label>
        `;
      });
      break;
      
    case "cook":
    case "kitchenhelper":
      kitchenSection.style.display = 'block';
      foodItems.forEach(i => {
        foodMenu.innerHTML += `
          <label>
            ${i.name} Sold: 
            <input 
              data-name="${i.name}" 
              data-price="${i.price}" 
              type="number" 
              min="0" 
              value="0"
              class="food-input"
              readonly
            />
          </label>
        `;
      });
      break;
      
    case "nanny":
      nannySection.style.display = 'block';
      break;
  }

  // Load existing data if available
  if (logs[key]) {
    const existingLog = logs[key];
    
    if (currentUser.role === "manager" || currentUser.role === "nanny") {
      logKids.value = existingLog.kids || '';
    }
    
    if (currentUser.role === "manager") {
      logExpenses.value = existingLog.expenses || '';
    }
    
    // Set drink quantities
    if (existingLog.drinks && (currentUser.role === "manager" || currentUser.role === "barista")) {
      existingLog.drinks.forEach(drink => {
        const input = document.querySelector(`.drink-input[data-name="${drink.name}"]`);
        if (input) input.value = drink.qty || 0;
      });
    }
    
    // Set food quantities
    if (existingLog.food && (currentUser.role === "manager" || currentUser.role === "cook" || currentUser.role === "kitchenhelper")) {
      existingLog.food.forEach(food => {
        const input = document.querySelector(`.food-input[data-name="${food.name}"]`);
        if (input) input.value = food.qty || 0;
      });
    }
    
    // Set attendance
    if (existingLog.attendance) {
      if (currentUser.role === "manager") {
        staff.forEach(role => {
          const select = document.querySelector(`.attendance-select[data-role="${role}"]`);
          if (select) select.value = existingLog.attendance[role] || 'present';
        });
      } else {
        const select = document.querySelector(`.attendance-select[data-role="${currentUser.role}"]`);
        if (select && existingLog.attendance[currentUser.role]) {
          select.value = existingLog.attendance[currentUser.role];
        }
      }
    }
    
    renderDaySummary(key);
    editLogBtn.style.display = currentUser.role === "manager" ? 'inline' : 'none';
  } else {
    editLogBtn.style.display = 'none';
  }

  // Set readonly for non-managers
  if (currentUser.role !== "manager") {
    logKids.readOnly = true;
    logExpenses.readOnly = true;
    document.querySelectorAll('.drink-input, .food-input').forEach(input => {
      input.readOnly = true;
    });
    saveLogBtn.style.display = 'none';
  } else {
    logKids.readOnly = false;
    logExpenses.readOnly = false;
    document.querySelectorAll('.drink-input, .food-input').forEach(input => {
      input.readOnly = false;
    });
    saveLogBtn.style.display = 'inline';
  }

  // Save button with proper data handling
  saveLogBtn.onclick = function() {
    if (currentUser.role !== "manager") return;
    
    // Collect all data with proper parsing
    const kids = parseInt(logKids.value) || 0;
    const expenses = parseInt(logExpenses.value) || 0;
    
    const drinks = [];
    document.querySelectorAll('.drink-input').forEach(input => {
      drinks.push({
        name: input.dataset.name,
        price: parseInt(input.dataset.price) || 0,
        qty: parseInt(input.value) || 0
      });
    });
    
    const food = [];
    document.querySelectorAll('.food-input').forEach(input => {
      food.push({
        name: input.dataset.name,
        price: parseInt(input.dataset.price) || 0,
        qty: parseInt(input.value) || 0
      });
    });
    
    // Collect attendance data
    const attendanceData = {};
    staff.forEach(role => {
      const select = document.querySelector(`.attendance-select[data-role="${role}"]`);
      attendanceData[role] = select.value;
    });
    
    // Update the log
    logs[key] = {
      kids: kids,
      expenses: expenses,
      drinks: drinks,
      food: food,
      attendance: attendanceData
    };
    
    // Save and update UI
    saveAll();
    renderDaySummary(key);
    editLogBtn.style.display = 'inline';
    
    // Visual feedback
    saveLogBtn.textContent = '✓ Saved!';
    saveLogBtn.style.backgroundColor = '#4CAF50';
    setTimeout(() => {
      saveLogBtn.textContent = 'Save';
      saveLogBtn.style.backgroundColor = '';
    }, 2000);
  };

  // Back button functionality
  backBtn.onclick = function() {
    dailyLog.style.display = 'none';
