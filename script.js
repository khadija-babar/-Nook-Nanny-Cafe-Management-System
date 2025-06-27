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
      bgVideo.src = s+".mp4";
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
  };
}

// Day summary
function renderDaySummary(key) {
  const D = logs[key];
  if (!D) return;
  
  let summaryHTML = `<strong>Daily Summary for ${currentUser.role}:</strong><br>`;
  
  // Attendance summary for all roles
  if (D.attendance && D.attendance[currentUser.role]) {
    summaryHTML += `📌 Your attendance: ${D.attendance[currentUser.role]}<br>`;
    
    if (D.attendance[currentUser.role] === 'absent') {
      summaryHTML += `⚠️ Absence deduction: PKR ${ABSENCE_DEDUCTION}<br>`;
    }
  }
  
  // Role-specific information
  switch(currentUser.role) {
    case "manager":
      const dt = D.drinks.reduce((s,x) => s + (x.qty * x.price), 0);
      const ft = D.food.reduce((s,x) => s + (x.qty * x.price), 0);
      const ns = D.kids * 2000;
      
      let attendanceDeductions = 0;
      staff.forEach(role => {
        if (D.attendance[role] === 'absent') {
          attendanceDeductions += ABSENCE_DEDUCTION;
        }
      });
      
      summaryHTML += `
        👶 ${D.kids} kids (Nanny PKR ${ns})<br>
        ☕ Drinks PKR ${dt}<br>
        🍴 Food PKR ${ft}<br>
        💸 Exp PKR ${D.expenses}<br>
        ${attendanceDeductions > 0 ? `⚠️ Absence Deductions: PKR ${attendanceDeductions}<br>` : ''}
        📈 Profit PKR ${dt + ft - D.expenses - ns - attendanceDeductions}
      `;
      break;
      
    case "barista":
      const drinkTotal = D.drinks.reduce((s,x) => s + (x.qty * x.price), 0);
      D.drinks.forEach(drink => {
        summaryHTML += `${drink.name}: ${drink.qty} sold (PKR ${drink.qty * drink.price})<br>`;
      });
      summaryHTML += `☕ Total drinks sold: PKR ${drinkTotal}`;
      break;
      
    case "cook":
    case "kitchenhelper":
      const foodTotal = D.food.reduce((s,x) => s + (x.qty * x.price), 0);
      D.food.forEach(item => {
        summaryHTML += `${item.name}: ${item.qty} sold (PKR ${item.qty * item.price})<br>`;
      });
      summaryHTML += `🍴 Total food sold: PKR ${foodTotal}`;
      break;
      
    case "nanny":
      summaryHTML += `👶 Kids cared for: ${D.kids} (Earnings: PKR ${D.kids * 2000})`;
      break;
      
    case "cleaner":
    case "receptionist":
      summaryHTML += "No additional information available for your role";
      break;
      
    default:
      summaryHTML += "No additional information available";
  }
  
  logSummary.innerHTML = summaryHTML;
}

// Monthly summary
function showMonthlySummary() {
  const y = current.getFullYear(), m = current.getMonth();
  const lastDay = new Date(y, m + 1, 0);
  
  let totKids = 0, totExp = 0, totDrinks = 0, totFood = 0;
  let daysWithData = 0;

  // Attendance tracking
  const attendanceSummary = {};
  staff.forEach(role => {
    attendanceSummary[role] = { present: 0, absent: 0, leave: 0 };
  });
  let totalAbsences = 0;
  let totalDeductions = 0;

  // Calculate totals for the entire month
  for(let d = 1; d <= lastDay.getDate(); d++) {
    const key = `${y}-${m}-${d}`;
    if(logs[key]) {
      daysWithData++;
      const dayLog = logs[key];
      
      totKids += Number(dayLog.kids) || 0;
      totExp += Number(dayLog.expenses) || 0;
      
      if(dayLog.drinks && Array.isArray(dayLog.drinks)) {
        dayLog.drinks.forEach(drink => {
          totDrinks += (Number(drink.qty) || 0) * (Number(drink.price) || 0);
        });
      }
      
      if(dayLog.food && Array.isArray(dayLog.food)) {
        dayLog.food.forEach(item => {
          totFood += (Number(item.qty) || 0) * (Number(item.price) || 0);
        });
      }
      
      // Track attendance
      if(dayLog.attendance) {
        staff.forEach(role => {
          const status = dayLog.attendance[role] || 'present';
          attendanceSummary[role][status]++;
          if(status === 'absent') {
            totalAbsences++;
            totalDeductions += ABSENCE_DEDUCTION;
          }
        });
      }
    }
  }

  // Salary calculations with deductions
  const baseSalaries = Object.values(salaries).reduce((a,b) => a + b, 0) - salaries.Nanny; // Nanny paid per child
  const nannySalary = totKids * salaries.Nanny;
  const totalSalaries = baseSalaries + nannySalary;
  const salariesAfterDeductions = totalSalaries - totalDeductions;
  
  const totalIncome = totDrinks + totFood;
  const totalProfit = totalIncome - totExp - salariesAfterDeductions;

  // Build role-specific summary display
  if (currentUser.role !== "manager") {
    summaryContent.innerHTML = `
      <div class="summary-section">
        <h3>📊 ${monthNames[m]} ${y} Summary (${currentUser.role})</h3>
        <p>Days with data: ${daysWithData}/${lastDay.getDate()}</p>
      </div>
      
      <div class="summary-section">
        <h4>Your Attendance Summary</h4>
        <p>
          Present: ${attendanceSummary[currentUser.role]?.present || 0} days<br>
          Absent: ${attendanceSummary[currentUser.role]?.absent || 0} days<br>
          On Leave: ${attendanceSummary[currentUser.role]?.leave || 0} days
        </p>
        ${attendanceSummary[currentUser.role]?.absent > 0 ? 
          `<p class="deduction">Total deductions: PKR ${(attendanceSummary[currentUser.role].absent * ABSENCE_DEDUCTION).toLocaleString()}</p>` : ''}
      </div>
    `;
    
    // Add role-specific information
    switch(currentUser.role) {
      case "barista":
        summaryContent.innerHTML += `
          <div class="summary-section">
            <h4>Drinks Sales</h4>
            <p>Total drinks revenue: PKR ${totDrinks.toLocaleString()}</p>
          </div>
        `;
        break;
        
      case "cook":
      case "kitchenhelper":
        summaryContent.innerHTML += `
          <div class="summary-section">
            <h4>Food Sales</h4>
            <p>Total food revenue: PKR ${totFood.toLocaleString()}</p>
          </div>
        `;
        break;
        
      case "nanny":
        summaryContent.innerHTML += `
          <div class="summary-section">
            <h4>Child Care</h4>
            <p>Total kids cared for: ${totKids}</p>
            <p>Total earnings: PKR ${(totKids * salaries.Nanny).toLocaleString()}</p>
          </div>
        `;
        break;
    }
    
    summaryContent.innerHTML += `
      <div class="summary-section">
        <p>Contact manager for any discrepancies in your records.</p>
      </div>
    `;
  } else {
    // Manager sees full summary
    summaryContent.innerHTML = `
      <div class="summary-section">
        <h3>📊 ${monthNames[m]} ${y} Summary</h3>
        <p>Days with data: ${daysWithData}/${lastDay.getDate()}</p>
      </div>
      
      <div class="summary-section">
        <h4>Income</h4>
        <p>☕ Drinks: PKR ${totDrinks.toLocaleString()}</p>
        <p>🍴 Food: PKR ${totFood.toLocaleString()}</p>
        <p class="total-line">💰 Total Income: PKR ${totalIncome.toLocaleString()}</p>
      </div>
      
      <div class="summary-section">
        <h4>Expenses</h4>
        <p>💸 Other Expenses: PKR ${totExp.toLocaleString()}</p>
      </div>
      
      <div class="summary-section">
        <h4>Salaries & Attendance</h4>
        ${staff.map(role => `
          <p>
            👨‍💼 ${role}: 
            <span class="attendance-detail">
              (Present: ${attendanceSummary[role].present}, 
              Leave: ${attendanceSummary[role].leave}, 
              Absent: ${attendanceSummary[role].absent})
            </span>
            <br>
            PKR ${(salaries[role] - (attendanceSummary[role].absent * ABSENCE_DEDUCTION)).toLocaleString()}
            ${attendanceSummary[role].absent > 0 ? 
              `<span class="deduction">-PKR ${(attendanceSummary[role].absent * ABSENCE_DEDUCTION).toLocaleString()}</span>` : ''}
          </p>
        `).join('')}
        <p>Nanny (${totKids} kids): PKR ${nannySalary.toLocaleString()}</p>
        <p class="total-line">
          Total Salaries: PKR ${salariesAfterDeductions.toLocaleString()}
          ${totalDeductions > 0 ? `<span class="deduction">(Deductions: PKR ${totalDeductions.toLocaleString()})</span>` : ''}
        </p>
      </div>
      
      <div class="summary-section highlight">
        <h4>Monthly Summary</h4>
        <p>📈 Total Income: PKR ${totalIncome.toLocaleString()}</p>
        <p>📉 Total Expenses: PKR ${(totExp + salariesAfterDeductions).toLocaleString()}</p>
        <p class="${totalProfit >= 0 ? 'profit-line' : 'loss-line'}">
          💲 Net Profit: PKR ${totalProfit.toLocaleString()}
        </p>
      </div>
    `;
  }
  
  // Add event listener for the back button
  document.getElementById('backFromSummary').onclick = () => {
    summaryBox.style.display = 'none';
  };
  
  summaryBox.style.display = 'flex';
}

// Save and rerender
function saveAll() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  localStorage.setItem('logs', JSON.stringify(logs));
  renderCalendar();
}

// Task buttons
addTaskBtn.onclick = () => {
  if (currentUser.role !== "manager") return;
  
  const txt = taskInput.value.trim(), dt = taskInput.dataset.date;
  if(!txt || !dt) return;
  const ix = tasks.findIndex(t => t.date === dt);
  if(ix >= 0) tasks[ix].text = txt;
  else tasks.push({date: dt, text: txt});
  taskInput.value = '';
  taskInput.dataset.date = '';
  taskInput.style.display = addTaskBtn.style.display = deleteTaskBtn.style.display = 'none';
  taskMessage.textContent = '';
  saveAll();
};

deleteTaskBtn.onclick = () => {
  if (currentUser.role !== "manager") return;
  
  const dt = taskInput.dataset.date;
  tasks = tasks.filter(t => t.date !== dt);
  taskInput.value = '';
  taskInput.dataset.date = '';
  taskInput.style.display = addTaskBtn.style.display = deleteTaskBtn.style.display = 'none';
  taskMessage.textContent = '';
  saveAll();
};

// Edit button functionality
editLogBtn.onclick = () => {
  if (currentUser.role !== "manager") return;
  
  const key = logDate.dataset.key;
  openLog(key);
};

// Navigation buttons
prevBtn.onclick = () => { 
  current.setMonth(current.getMonth() - 1); 
  saveAll(); 
};

nextBtn.onclick = () => { 
  current.setMonth(current.getMonth() + 1); 
  saveAll(); 
};

showSummaryBtn.onclick = showMonthlySummary;

// Close summary buttons
closeSummaryBtn.onclick = () => summaryBox.style.display = 'none';
backFromSummaryBtn.onclick = () => summaryBox.style.display = 'none';

// Initialize with login overlay
loginOverlay.style.display = 'flex';
renderCalendar();

/**
 * Saves all application data to localStorage and updates the calendar view
 * Includes comprehensive error handling and fallback mechanisms
 */
function saveAll() {
  try {
    // Save tasks with timestamp
    const tasksToSave = {
      data: tasks,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('tasks', JSON.stringify(tasksToSave));
    
    // Save logs with compression for large data
    const logsToSave = {
      data: logs,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('logs', JSON.stringify(logsToSave));
    
    console.log("Data successfully saved to localStorage");
  } catch (e) {
    console.error("LocalStorage failed:", e);
    
    // Fallback mechanisms
    try {
      console.warn("Attempting sessionStorage fallback");
      sessionStorage.setItem('tasks_backup', JSON.stringify(tasks));
      sessionStorage.setItem('logs_backup', JSON.stringify(logs));
    } catch (e2) {
      console.error("sessionStorage also failed:", e2);
      // Ultimate fallback to memory (will reset on page refresh)
      window.tempMemoryStore = {
        tasks: [...tasks],
        logs: {...logs},
        lastResort: true
      };
    }
  } finally {
    // Always update the UI
    renderCalendar();
  }
}

/**
 * Handles user login with validation and debugging
 * @returns {boolean} True if login successful, false otherwise
 */
function login() {
  console.group("Login Attempt"); // Group related logs
  
  try {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    console.debug("Login credentials received:", { 
      username, 
      password: password.replace(/./g, '*') // Mask password
    });
    
    // Validation
    if (!username || !password) {
      console.warn("Validation failed - empty fields");
      showAlert("Username and password are required", "error");
      return false;
    }
    
    // Authentication logic
    const user = authenticateUser(username, password);
    
    if (user) {
      console.log("Login successful for user:", user.username);
      startSession(user);
      return true;
    } else {
      console.warn("Login failed - invalid credentials");
      showAlert("Invalid username or password", "error");
      return false;
    }
  } catch (error) {
    console.error("Login process failed:", error);
    showAlert("An unexpected error occurred during login", "error");
    return false;
  } finally {
    console.groupEnd(); // End log group
  }
}

// Helper functions
function authenticateUser(username, password) {
  // Implementation would check against your user database
  console.debug("Authenticating user:", username);
  return usersDB.find(u => 
    u.username === username && 
    u.password === hashPassword(password)
  );
}

function startSession(user) {
  console.log("Starting session for:", user.username);
  currentUser = user;
  // Additional session setup
}

function showAlert(message, type) {
  console.log(`Showing ${type} alert:`, message);
  // UI alert implementation
}
