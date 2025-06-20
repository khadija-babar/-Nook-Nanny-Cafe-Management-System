const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
let current = new Date();
let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
let logs = JSON.parse(localStorage.getItem('logs') || '{}');

// Elements
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

// Employee salaries
const salaries = {
  Manager: 50000,
  Barista: 15000,
  Cook: 20000,
  KitchenHelper: 10000,
  Cleaner: 20000,
  Receptionist: 10000,
  Nanny: 2000 // per child
};

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
        taskInput.style.display = addTaskBtn.style.display = deleteTaskBtn.style.display = 'inline';
        taskInput.dataset.date = key;
        taskInput.value = T.text;
      } else {
        promptMenu(key,m,d);
      }
    };
    daysEl.appendChild(cell);
  }
  setSeasonClass(current.getMonth());
}

// Options 1|2|3
function promptMenu(key,mName,d) {
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
  dailyLog.style.display = 'flex';
  logDate.textContent = `Log for ${key}`;
  logDate.dataset.key = key;
  logKids.value = '';
  logExpenses.value = '';
  drinksMenu.innerHTML = '';
  foodMenu.innerHTML = '';
  logSummary.textContent = '';

  // Create drink items inputs with unique classes
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

  // Create food items inputs with unique classes
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

  // Load existing data if available
  if (logs[key]) {
    const existingLog = logs[key];
    logKids.value = existingLog.kids || '';
    logExpenses.value = existingLog.expenses || '';
    
    // Set drink quantities
    if (existingLog.drinks) {
      existingLog.drinks.forEach(drink => {
        const input = document.querySelector(`.drink-input[data-name="${drink.name}"]`);
        if (input) input.value = drink.qty || 0;
      });
    }
    
    // Set food quantities
    if (existingLog.food) {
      existingLog.food.forEach(food => {
        const input = document.querySelector(`.food-input[data-name="${food.name}"]`);
        if (input) input.value = food.qty || 0;
      });
    }
    
    renderDaySummary(key);
    editLogBtn.style.display = 'inline';
  } else {
    editLogBtn.style.display = 'none';
  }

  // Save button with proper data handling
  saveLogBtn.onclick = function() {
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
    
    // Update the log
    logs[key] = {
      kids: kids,
      expenses: expenses,
      drinks: drinks,
      food: food
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
  
  const dt = D.drinks.reduce((s,x) => s + (x.qty * x.price), 0);
  const ft = D.food.reduce((s,x) => s + (x.qty * x.price), 0);
  const ns = D.kids * 2000;
  logSummary.innerHTML = `
    👶 ${D.kids} kids (Nanny PKR ${ns})<br>
    ☕ Drinks PKR ${dt}<br>
    🍴 Food PKR ${ft}<br>
    💸 Exp PKR ${D.expenses}<br>
    📈 Profit PKR ${dt + ft - D.expenses - ns}
  `;
}

// Monthly summary
function showMonthlySummary() {
  const y = current.getFullYear(), m = current.getMonth();
  const lastDay = new Date(y, m + 1, 0);
  
  let totKids = 0, totExp = 0, totDrinks = 0, totFood = 0;
  let daysWithData = 0;

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
    }
  }

  // Salary calculations
  const totalSalaries = 50000 + 15000 + 20000 + 10000 + 20000 + 10000 + (totKids * 2000);
  const totalIncome = totDrinks + totFood;
  const totalProfit = totalIncome - totExp - totalSalaries;

  // Build the summary display
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
      <h4>Salaries</h4>
      <p>👔 Manager: PKR 50,000</p>
      <p>☕ Barista: PKR 15,000</p>
      <p>👨‍🍳 Cook: PKR 20,000</p>
      <p>🧑‍🍳 Kitchen Helper: PKR 10,000</p>
      <p>🧹 Cleaner: PKR 20,000</p>
      <p>💁 Receptionist: PKR 10,000</p>
      <p>👶 Nanny (${totKids} kids): PKR ${(totKids * 2000).toLocaleString()}</p>
      <p class="total-line">💵 Total Salaries: PKR ${totalSalaries.toLocaleString()}</p>
    </div>
    
    <div class="summary-section highlight">
      <h4>Monthly Summary</h4>
      <p>📈 Total Income: PKR ${totalIncome.toLocaleString()}</p>
      <p>📉 Total Expenses: PKR ${(totExp + totalSalaries).toLocaleString()}</p>
      <p class="profit-line">💲 Net Profit: PKR ${totalProfit.toLocaleString()}</p>
      <button id="backFromSummary" class="back-button">Back to Calendar</button>
    </div>
  `;
  
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

// Initial render
renderCalendar();
