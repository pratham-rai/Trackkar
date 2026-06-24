/**
 * Trackkar – Visual Habit Tracker
 * Main Script - Handles state, rendering, charts, gamification, and PWA setup.
 */

// ==================== 1. STATE MANAGEMENT & GLOBALS ====================
let state = {
  profile: {
    name: "",
    month: new Date().getMonth(), // 0-11
    year: new Date().getFullYear(),
    goalTheme: "Productivity",
    xp: 0,
    level: 1
  },
  habits: [],
  badges: [] // Unlocked badge IDs
};

const DB_KEY = 'trackkar_db_state';

// Badge Definition Registry
const BADGE_REGISTRY = {
  'first-habit': { name: 'First Step', desc: 'Created your first habit!', icon: '🌱' },
  'streak-3': { name: '3-Day Warrior', desc: 'Maintained a 3-day habit streak!', icon: '🛡️' },
  'streak-7': { name: 'Weekly Champion', desc: 'Maintained a 7-day habit streak!', icon: '⚔️' },
  'streak-15': { name: 'Half-Month Hero', desc: 'Maintained a 15-day habit streak!', icon: '🌟' },
  'streak-30': { name: '30-Day Legend', desc: 'Maintained an entire 30-day streak!', icon: '👑' },
  'perfect-day': { name: 'Perfect Day', desc: 'Completed all active habits in a single day!', icon: '✨' },
  'comeback': { name: 'Comeback Legend', desc: 'Completed a habit after missing it for 3+ consecutive days!', icon: '🔥' }
};

// Category Icons Mapping
const CATEGORY_ICONS = {
  'Study': '🎓',
  'Fitness': '💪',
  'Health': '❤️',
  'Sleep': '🌙',
  'Water': '💧',
  'Meditation': '🧘',
  'Reading': '📚',
  'Job Applications': '💼',
  'Coding Practice': '💻',
  'No Social Media': '📵',
  'No Junk Food': '🍎',
  'Budget Tracking': '💰',
  'Prayer/Spiritual': '🙏',
  'Journaling': '📝',
  'Custom': '✨'
};

// Preset Routine Collections
const PRESET_ROUTINES = {
  student: [
    { name: "Study 2 hours", category: "Study", color: "#8a2be2", target: 5, priority: "High" },
    { name: "Revise notes", category: "Study", color: "#1e90ff", target: 5, priority: "Medium" },
    { name: "Practice coding", category: "Coding Practice", color: "#008080", target: 5, priority: "High" },
    { name: "Read 10 pages", category: "Reading", color: "#2e8b57", target: 7, priority: "Low" },
    { name: "Sleep before 11 PM", category: "Sleep", color: "#ff1493", target: 7, priority: "High" }
  ],
  fitness: [
    { name: "Workout", category: "Fitness", color: "#ff4500", target: 4, priority: "High" },
    { name: "Walk 8000 steps", category: "Fitness", color: "#ff1493", target: 7, priority: "Medium" },
    { name: "Drink 3L water", category: "Water", color: "#1e90ff", target: 7, priority: "High" },
    { name: "Eat clean", category: "No Junk Food", color: "#2e8b57", target: 6, priority: "High" },
    { name: "Sleep 7 hours", category: "Sleep", color: "#8a2be2", target: 7, priority: "Medium" }
  ],
  job: [
    { name: "Apply to 5 jobs", category: "Job Applications", color: "#8a2be2", target: 5, priority: "High" },
    { name: "Update LinkedIn profile", category: "Job Applications", color: "#1e90ff", target: 2, priority: "Medium" },
    { name: "Practice coding tests", category: "Coding Practice", color: "#008080", target: 5, priority: "High" },
    { name: "Practice interview questions", category: "Custom", color: "#ff4500", target: 3, priority: "Medium" },
    { name: "Work on portfolio projects", category: "Coding Practice", color: "#2e8b57", target: 4, priority: "High" }
  ],
  spiritual: [
    { name: "Morning prayer/reflection", category: "Prayer/Spiritual", color: "#ff1493", target: 7, priority: "Medium" },
    { name: "Meditation 15 mins", category: "Meditation", color: "#008080", target: 7, priority: "High" },
    { name: "Read scripture", category: "Prayer/Spiritual", color: "#8a2be2", target: 6, priority: "Medium" },
    { name: "Write in gratitude journal", category: "Journaling", color: "#2e8b57", target: 7, priority: "Low" },
    { name: "Acts of kindness", category: "Custom", color: "#1e90ff", target: 5, priority: "Medium" }
  ],
  detox: [
    { name: "No social media", category: "No Social Media", color: "#ff4500", target: 7, priority: "High" },
    { name: "No junk food", category: "No Junk Food", color: "#2e8b57", target: 6, priority: "Medium" },
    { name: "No screen after 9:30 PM", category: "Sleep", color: "#8a2be2", target: 7, priority: "High" },
    { name: "Read a physical book", category: "Reading", color: "#1e90ff", target: 7, priority: "Low" },
    { name: "Journaling", category: "Journaling", color: "#ff1493", target: 5, priority: "Medium" }
  ],
  growth: [
    { name: "Read daily (15 mins)", category: "Reading", color: "#2e8b57", target: 7, priority: "Medium" },
    { name: "Learn a new skill", category: "Study", color: "#008080", target: 5, priority: "High" },
    { name: "Track daily expenses", category: "Budget Tracking", color: "#3b82f6", target: 7, priority: "Medium" },
    { name: "Drink enough water", category: "Water", color: "#1e90ff", target: 7, priority: "Medium" },
    { name: "8 hours sleep", category: "Sleep", color: "#8a2be2", target: 7, priority: "High" }
  ]
};

// Chart Globals to avoid redraw conflicts
let charts = {
  daily: null,
  weekly: null,
  category: null,
  donut: null
};

// Motivational Quotes Registry
const MOTIVATIONAL_QUOTES = [
  { text: "The secret of your future is hidden in your daily routine.", author: "Mike Murdock" },
  { text: "It is easier to prevent bad habits than to break them.", author: "Benjamin Franklin" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "Streaks are chains. Don't break the chain.", author: "Jerry Seinfeld" },
  { text: "Your habits will determine your future.", author: "Jack Canfield" }
];

// Initialize and Load database from LocalStorage
function loadState() {
  const stored = localStorage.getItem(DB_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object') {
        state = parsed;
        if (!state.badges) state.badges = [];
        if (!state.habits) state.habits = [];
        if (!state.profile) state.profile = {};
        if (state.profile.xp === undefined) state.profile.xp = 0;
        if (state.profile.level === undefined) state.profile.level = 1;
        return true;
      }
    } catch (e) {
      console.error("Failed parsing stored state, recreating.", e);
    }
  }
  return false;
}

function saveState() {
  localStorage.setItem(DB_KEY, JSON.stringify(state));
}

// ==================== 2. BOOTSTRAPPING & SYSTEM ONBOARDING ====================
function refreshActiveView() {
  const activeNavItem = document.querySelector('.nav-item.active, .mobile-nav-item.active');
  if (activeNavItem) {
    const viewId = activeNavItem.getAttribute('data-view');
    if (viewId === 'dashboard') renderDashboard();
    else if (viewId === 'tracker') renderTrackerView();
    else if (viewId === 'habits') renderHabitList();
    else if (viewId === 'analytics') renderAnalytics();
    else if (viewId === 'settings') loadSettingsPanel();
  }
}

function init() {
  // Populate Header Year Selector
  const yearSelects = [
    document.getElementById('header-year-select')
  ];
  const currentYear = new Date().getFullYear();
  yearSelects.forEach(select => {
    if (select) {
      select.innerHTML = '';
      for (let y = currentYear - 2; y <= currentYear + 5; y++) {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y;
        if (y === currentYear) opt.selected = true;
        select.appendChild(opt);
      }
    }
  });

  const stateExists = loadState();
  if (stateExists && state.profile && state.profile.name) {
    document.getElementById('onboarding-overlay').classList.remove('active');
    applyVisualThemeSettings();
    initializeApplication();
  } else {
    // Show Onboarding overlay
    document.getElementById('onboarding-overlay').classList.add('active');
  }

  // Bind Onboarding Submit Action
  const obForm = document.getElementById('onboarding-form');
  if (obForm) {
    obForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const usernameInput = document.getElementById('ob-username');
      const themeInput = document.getElementById('ob-theme');

      const username = usernameInput ? usernameInput.value.trim() : "User";
      const month = new Date().getMonth();
      const year = new Date().getFullYear();
      const theme = themeInput ? themeInput.value : "Productivity";

      state.profile = {
        name: username,
        month: month,
        year: year,
        goalTheme: theme,
        xp: 0,
        level: 1
      };
      state.habits = [];
      state.badges = [];

      // Pre-populate with routine stack templates if theme matches
      prepopulateOnboardingRoutine(theme);

      saveState();
      document.getElementById('onboarding-overlay').classList.remove('active');
      applyVisualThemeSettings();
      initializeApplication();
      showToast("Welcome to Trackkar, " + username + "! Your dashboard is ready.", "success");
    });
  }

  // Bind Period selectors in header
  const headerMonthSelect = document.getElementById('header-month-select');
  const headerYearSelect = document.getElementById('header-year-select');

  const onHeaderPeriodChange = () => {
    state.profile.month = parseInt(headerMonthSelect.value);
    state.profile.year = parseInt(headerYearSelect.value);

    saveState();
    
    // Update displayed elements
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    refreshActiveView();
    showToast(`Switched tracking period to ${monthNames[state.profile.month]} ${state.profile.year}`, "info");
  };

  if (headerMonthSelect) headerMonthSelect.addEventListener('change', onHeaderPeriodChange);
  if (headerYearSelect) headerYearSelect.addEventListener('change', onHeaderPeriodChange);


  
  // Bind Tracker sub-view toggle buttons (Monthly / Weekly)
  const btnMonthly = document.getElementById('btn-tracker-monthly');
  const btnWeekly = document.getElementById('btn-tracker-weekly');
  const monthlyContainer = document.getElementById('tracker-monthly-container');
  const weeklyContainer = document.getElementById('tracker-weekly-container');

  if (btnMonthly && btnWeekly) {
    btnMonthly.addEventListener('click', () => {
      btnMonthly.classList.add('active');
      btnWeekly.classList.remove('active');
      monthlyContainer.classList.remove('hidden');
      weeklyContainer.classList.add('hidden');
      renderMonthlyTrackerGrid();
    });

    btnWeekly.addEventListener('click', () => {
      btnWeekly.classList.add('active');
      btnMonthly.classList.remove('active');
      weeklyContainer.classList.remove('hidden');
      monthlyContainer.classList.add('hidden');
      renderWeeklyViewGrid();
    });
  }

  // Tab Views Setup
  setupNavigation();
  
  // Modal Trigger bindings
  setupModals();

  // Habit Pack Template listeners
  setupTemplates();

  // Settings Actions
  setupSettings();
  
  // Register service worker for offline
  registerServiceWorker();
}

// Safe bootstrap execution check
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Pre-populates habits based on goal theme selected in Onboarding
function prepopulateOnboardingRoutine(theme) {
  let packKey = null;
  if (theme === 'Study') packKey = 'student';
  else if (theme === 'Fitness') packKey = 'fitness';
  else if (theme === 'Health') packKey = 'growth';
  else if (theme === 'Spiritual') packKey = 'spiritual';
  else if (theme === 'Job Search') packKey = 'job';
  else if (theme === 'Productivity') packKey = 'growth';

  if (packKey && PRESET_ROUTINES[packKey]) {
    PRESET_ROUTINES[packKey].forEach(item => {
      state.habits.push({
        id: generateUUID(),
        name: item.name,
        category: item.category,
        color: item.color,
        icon: CATEGORY_ICONS[item.category] || '✨',
        target: item.target,
        priority: item.priority,
        active: true,
        history: {}
      });
    });
    // First habit badge
    unlockBadge('first-habit');
  }
}

// Apply accent colors and theme settings
function applyVisualThemeSettings() {
  // Always light mode
  document.documentElement.setAttribute('data-theme', 'light');

  // Accent Color flag
  const accent = localStorage.getItem('trackkar_accent') || '#8a2be2';
  document.documentElement.style.setProperty('--accent-color', accent);
  document.documentElement.style.setProperty('--accent-hover', adjustColorBrightness(accent, -15));
  document.documentElement.style.setProperty('--accent-light', hexToRgba(accent, 0.1));
  document.documentElement.style.setProperty('--accent-rgb', hexToRgbComponents(accent));
  
  // Update palette dot active states in settings
  document.querySelectorAll('.color-dot').forEach(dot => {
    if (dot.getAttribute('data-color') === accent) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
}

// ==================== 3. VIEW ROUTER NAVIGATION ====================
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item, .mobile-nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetView = item.getAttribute('data-view');
      switchView(targetView);
      
      // Update UI active buttons
      navItems.forEach(nav => {
        if (nav.getAttribute('data-view') === targetView) {
          nav.classList.add('active');
        } else {
          nav.classList.remove('active');
        }
      });
    });
  });
}

function switchView(viewId) {
  // Hide all views, display target
  const views = document.querySelectorAll('.app-view');
  views.forEach(v => v.classList.remove('active'));
  
  const target = document.getElementById(`view-${viewId}`);
  if (target) {
    target.classList.add('active');
    
    // Trigger tab-specific loaders
    if (viewId === 'dashboard') {
      renderDashboard();
    } else if (viewId === 'tracker') {
      renderTrackerView();
    } else if (viewId === 'habits') {
      renderHabitList();
    } else if (viewId === 'analytics') {
      renderAnalytics();
    } else if (viewId === 'settings') {
      loadSettingsPanel();
    }
  }
}

function renderTrackerView() {
  const isWeeklyActive = document.getElementById('btn-tracker-weekly').classList.contains('active');
  if (isWeeklyActive) {
    renderWeeklyViewGrid();
  } else {
    renderMonthlyTrackerGrid();
  }
}

// ==================== 4. APPLICATION INITIALIZATION & CORE RE-RENDER ====================
function initializeApplication() {
  // Recalculate XP and badges first to heal any state drift
  recalculateXPAndBadges();
  saveState();

  // Fill Header user details
  document.getElementById('header-username').textContent = state.profile.name;
  document.getElementById('header-level').textContent = state.profile.level;
  
  // Set Month/Year header dropdown values to match profile state
  const headerMonthSelect = document.getElementById('header-month-select');
  const headerYearSelect = document.getElementById('header-year-select');
  if (headerMonthSelect) headerMonthSelect.value = state.profile.month;
  if (headerYearSelect) headerYearSelect.value = state.profile.year;
  
  // Set Random Quote
  setDailyQuote();

  // Load Dashboard initially
  switchView('dashboard');
}

function setDailyQuote() {
  // Select quote based on day of month to stay stable for the day
  const day = new Date().getDate();
  const index = day % MOTIVATIONAL_QUOTES.length;
  const quote = MOTIVATIONAL_QUOTES[index];
  document.getElementById('motivational-quote').textContent = `"${quote.text}"`;
  document.getElementById('quote-author').textContent = `— ${quote.author}`;
}

// ==================== 5. VIEW BUILDER: DASHBOARD ====================
function renderDashboard() {
  const activeHabits = state.habits.filter(h => h.active);
  const totalActiveCount = activeHabits.length;
  
  // Header names
  document.getElementById('dash-username').textContent = state.profile.name;
  
  // 1. Calculate Monthly Progress Rate
  const daysInMonth = getDaysInMonth(state.profile.month, state.profile.year);
  let totalPossibleChecks = 0;
  let totalCompletions = 0;
  
  activeHabits.forEach(habit => {
    // Generate all keys for active month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = getFormattedDateKey(state.profile.year, state.profile.month, d);
      totalPossibleChecks++;
      if (habit.history[dateKey] === 'completed') {
        totalCompletions++;
      }
    }
  });

  const completionRate = totalPossibleChecks > 0 ? Math.round((totalCompletions / totalPossibleChecks) * 100) : 0;
  
  // Render Radial progress loader
  document.getElementById('dash-completion-rate').textContent = `${completionRate}%`;
  const strokeArray = `${completionRate}, 100`;
  document.getElementById('radial-progress-bar').setAttribute('stroke-dasharray', strokeArray);

  // 2. Count Today's completions
  const todayDate = new Date();
  const todayKey = getFormattedDateKey(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
  let completedTodayCount = 0;
  activeHabits.forEach(h => {
    if (h.history[todayKey] === 'completed') completedTodayCount++;
  });
  document.getElementById('dash-completed-today').textContent = completedTodayCount;

  // 3. Level & XP Visual Bar
  document.getElementById('dash-level').textContent = state.profile.level;
  document.getElementById('dash-current-xp').textContent = state.profile.xp % 100;
  document.getElementById('dash-next-xp').textContent = 100;
  const xpPct = state.profile.xp % 100;
  document.getElementById('dash-xp-fill').style.width = `${xpPct}%`;

  // 4. Streaks
  let currentBestStreak = 0;
  let longestStreak = 0;
  activeHabits.forEach(h => {
    const s = calculateStreaks(h);
    if (s.current > currentBestStreak) currentBestStreak = s.current;
    if (s.longest > longestStreak) longestStreak = s.longest;
  });
  document.getElementById('dash-current-streak').textContent = `${currentBestStreak} day${currentBestStreak !== 1 ? 's' : ''}`;
  document.getElementById('dash-longest-streak').textContent = `${longestStreak} day${longestStreak !== 1 ? 's' : ''}`;

  // Mini streak badges render
  const streakMiniContainer = document.getElementById('streak-badges-mini');
  streakMiniContainer.innerHTML = '';
  activeHabits.forEach(h => {
    const s = calculateStreaks(h);
    if (s.current >= 3) {
      const pill = document.createElement('span');
      pill.className = 'badge-pill-mini';
      pill.style.borderColor = h.color;
      pill.style.color = h.color;
      pill.style.backgroundColor = hexToRgba(h.color, 0.1);
      pill.textContent = `${h.name}: ${s.current}🔥`;
      streakMiniContainer.appendChild(pill);
    }
  });
  if (streakMiniContainer.children.length === 0) {
    streakMiniContainer.innerHTML = '<span class="subtitle-text text-muted">No active streaks above 3 days. Start checking off boxes!</span>';
  }

  // 5. Badges Unlocked Grid
  const badgesContainer = document.getElementById('badges-unlocked-grid');
  badgesContainer.innerHTML = '';
  Object.keys(BADGE_REGISTRY).forEach(badgeId => {
    const bDef = BADGE_REGISTRY[badgeId];
    const unlocked = state.badges.includes(badgeId);
    
    const slot = document.createElement('div');
    slot.className = `badge-slot-mini ${unlocked ? '' : 'locked'}`;
    slot.title = `${bDef.name}: ${bDef.desc}`;
    slot.innerHTML = unlocked ? bDef.icon : '❓';
    
    badgesContainer.appendChild(slot);
  });

  // 6. Don't Break the Chain View
  renderChainSection();

  // 7. Weekly Progress Cards
  renderWeeklyProgressCards();

  // 8. Top 10 Habits Table
  renderTopHabitsTable();
}

function renderChainSection() {
  const chainContainer = document.getElementById('chain-habits-container');
  chainContainer.innerHTML = '';
  
  const activeHabits = state.habits.filter(h => h.active);
  if (activeHabits.length === 0) {
    chainContainer.innerHTML = '<p class="subtitle-text text-muted">No active habits. Create a habit to start your chain!</p>';
    return;
  }

  // We show a chain for the last 5 days up to today
  const today = new Date();
  const last5Days = [];
  for (let i = 4; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    last5Days.push(d);
  }

  activeHabits.forEach(habit => {
    const streaks = calculateStreaks(habit);
    
    const row = document.createElement('div');
    row.className = 'chain-row';
    
    // Info
    const info = document.createElement('div');
    info.className = 'chain-habit-info';
    
    const dot = document.createElement('span');
    dot.className = 'chain-habit-color';
    dot.style.backgroundColor = habit.color;
    
    const name = document.createElement('span');
    name.className = 'chain-habit-name';
    name.textContent = habit.name;
    
    const streakVal = document.createElement('span');
    streakVal.className = 'chain-habit-streak';
    streakVal.textContent = streaks.current > 0 ? `${streaks.current}d 🔥` : '';
    
    info.appendChild(dot);
    info.appendChild(name);
    info.appendChild(streakVal);
    
    // Chain links (checkbox indicators)
    const links = document.createElement('div');
    links.className = 'chain-links';
    
    last5Days.forEach(date => {
      const dateKey = getFormattedDateKey(date.getFullYear(), date.getMonth(), date.getDate());
      const status = habit.history[dateKey];
      
      const link = document.createElement('div');
      link.className = `chain-link ${status === 'completed' ? 'completed' : status === 'missed' ? 'missed' : ''}`;
      
      const dayNum = date.getDate();
      link.textContent = dayNum;
      link.title = date.toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
      
      links.appendChild(link);
    });
    
    row.appendChild(info);
    row.appendChild(links);
    chainContainer.appendChild(row);
  });
}

function renderWeeklyProgressCards() {
  const container = document.getElementById('weekly-progress-cards');
  container.innerHTML = '';
  
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 is Sun, 1 is Mon...
  
  // Calculate Start of week (Monday)
  // standard js: if today is Sun(0), offset is -6. If Mon(1), offset is 0.
  const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  const monday = new Date();
  monday.setDate(today.getDate() + distanceToMonday);

  const activeHabits = state.habits.filter(h => h.active);
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(monday);
    currentDate.setDate(monday.getDate() + i);
    const dateKey = getFormattedDateKey(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    
    // calculate daily pct
    let completed = 0;
    let logged = 0;
    activeHabits.forEach(h => {
      if (h.history[dateKey] === 'completed') {
        completed++;
        logged++;
      } else if (h.history[dateKey] === 'missed') {
        logged++;
      }
    });

    const dailyPct = activeHabits.length > 0 ? Math.round((completed / activeHabits.length) * 100) : 0;
    const isToday = currentDate.toDateString() === today.toDateString();

    const card = document.createElement('div');
    card.className = `weekly-card-item ${isToday ? 'today' : ''}`;
    
    const dayLabel = document.createElement('span');
    dayLabel.className = 'weekly-card-day';
    dayLabel.textContent = dayNames[i];
    
    const pctVal = document.createElement('span');
    pctVal.className = 'weekly-card-pct';
    pctVal.textContent = `${dailyPct}%`;
    
    const dot = document.createElement('div');
    dot.className = 'weekly-card-dot';
    if (dailyPct === 100 && activeHabits.length > 0) dot.classList.add('success');
    else if (dailyPct > 50) dot.classList.add('warning');
    else if (dailyPct > 0) dot.classList.add('danger');

    card.appendChild(dayLabel);
    card.appendChild(pctVal);
    card.appendChild(dot);
    
    container.appendChild(card);
  }
}

function renderTopHabitsTable() {
  const tbody = document.querySelector('#top-habits-table tbody');
  tbody.innerHTML = '';
  
  const activeHabits = state.habits.filter(h => h.active);
  if (activeHabits.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center subtitle-text text-muted">No habits defined yet.</td></tr>';
    return;
  }

  const daysInMonth = getDaysInMonth(state.profile.month, state.profile.year);

  // Compute metrics for sorting
  const habitsData = activeHabits.map(h => {
    let completed = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const k = getFormattedDateKey(state.profile.year, state.profile.month, d);
      if (h.history[k] === 'completed') completed++;
    }
    const rate = daysInMonth > 0 ? Math.round((completed / daysInMonth) * 100) : 0;
    const streaks = calculateStreaks(h);
    return {
      habit: h,
      completedRate: rate,
      streak: streaks.current
    };
  });

  // Sort by completedRate desc, then streak desc
  habitsData.sort((a, b) => b.completedRate - a.completedRate || b.streak - a.streak);
  
  // Slice top 10
  const top10 = habitsData.slice(0, 10);
  
  top10.forEach(item => {
    const tr = document.createElement('tr');
    
    const tdName = document.createElement('td');
    tdName.style.fontWeight = '600';
    tdName.textContent = item.habit.name;
    
    const tdCat = document.createElement('td');
    tdCat.textContent = `${CATEGORY_ICONS[item.habit.category] || '✨'} ${item.habit.category}`;
    
    const tdPct = document.createElement('td');
    tdPct.textContent = `${item.completedRate}%`;
    
    const tdStreak = document.createElement('td');
    tdStreak.textContent = item.streak > 0 ? `${item.streak} days 🔥` : '0';
    
    tr.appendChild(tdName);
    tr.appendChild(tdCat);
    tr.appendChild(tdPct);
    tr.appendChild(tdStreak);
    
    tbody.appendChild(tr);
  });
}

// ==================== 6. VIEW BUILDER: MONTHLY GRID ====================
function renderMonthlyTrackerGrid() {
  const table = document.getElementById('tracker-grid-table');
  const thead = table.querySelector('thead');
  const tbody = table.querySelector('tbody');
  
  thead.innerHTML = '';
  tbody.innerHTML = '';
  
  const activeHabits = state.habits.filter(h => h.active);
  const daysInMonth = getDaysInMonth(state.profile.month, state.profile.year);
  
  if (activeHabits.length === 0) {
    thead.innerHTML = '<tr><th>Habit Checklist Matrix</th></tr>';
    tbody.innerHTML = '<tr><td class="text-center padding-md subtitle-text text-muted">Create active habits in the Habit List tab to view the spreadsheet matrix.</td></tr>';
    return;
  }

  // 1. Build Table Headers
  const headerRow = document.createElement('tr');
  
  const cornerHeader = document.createElement('th');
  cornerHeader.className = 'habit-info-col';
  cornerHeader.textContent = 'Habits';
  headerRow.appendChild(cornerHeader);
  
  const today = new Date();
  const isCurrentMonthYear = today.getMonth() === state.profile.month && today.getFullYear() === state.profile.year;
  const todayDateNum = today.getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const th = document.createElement('th');
    th.className = 'date-col';
    th.textContent = d;
    
    if (isCurrentMonthYear && d === todayDateNum) {
      th.classList.add('today-col');
      th.title = "Today";
    }
    headerRow.appendChild(th);
  }
  
  const endHeader = document.createElement('th');
  endHeader.className = 'summary-col';
  endHeader.textContent = '%';
  headerRow.appendChild(endHeader);
  
  thead.appendChild(headerRow);

  // 2. Build rows for each habit
  activeHabits.forEach(habit => {
    const tr = document.createElement('tr');
    
    // Header Col: Habit Info
    const tdInfo = document.createElement('td');
    tdInfo.className = 'habit-info-col';
    
    const metaDiv = document.createElement('div');
    metaDiv.className = 'habit-grid-meta';
    
    const iconSpan = document.createElement('span');
    iconSpan.className = 'category-icon-indicator';
    iconSpan.textContent = habit.icon || '✨';
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'habit-grid-name';
    nameSpan.textContent = habit.name;
    nameSpan.style.borderLeft = `3px solid ${habit.color}`;
    nameSpan.style.paddingLeft = '6px';
    
    metaDiv.appendChild(iconSpan);
    metaDiv.appendChild(nameSpan);
    tdInfo.appendChild(metaDiv);
    tr.appendChild(tdInfo);
    
    // Interactive Grid Cells (1 to 31)
    let completedCount = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const td = document.createElement('td');
      td.className = 'tracker-grid-cell';
      
      const dateKey = getFormattedDateKey(state.profile.year, state.profile.month, d);
      const status = habit.history[dateKey];
      
      if (status === 'completed') {
        td.classList.add('completed');
        td.textContent = '✓';
        completedCount++;
      } else if (status === 'missed') {
        td.classList.add('missed');
        td.textContent = '✕';
      } else {
        td.textContent = '';
      }
      
      if (isCurrentMonthYear && d === todayDateNum) {
        td.classList.add('today-col');
      }

      // Check if this date is in the future relative to the current actual date
      const cellDate = new Date(state.profile.year, state.profile.month, d);
      const todayCompare = new Date();
      todayCompare.setHours(0, 0, 0, 0);
      cellDate.setHours(0, 0, 0, 0);
      const isFuture = cellDate > todayCompare;

      if (isFuture) {
        td.classList.add('future-cell');
        td.title = "Future date - tracking locked";
      } else {
        // Cell Click cycle handler
        td.addEventListener('click', () => {
          cycleCellStatus(habit.id, dateKey);
        });
      }
      
      tr.appendChild(td);
    }
    
    // Summary percentage col
    const tdPct = document.createElement('td');
    tdPct.className = 'summary-col';
    const rowPct = daysInMonth > 0 ? Math.round((completedCount / daysInMonth) * 100) : 0;
    tdPct.textContent = `${rowPct}%`;
    
    tr.appendChild(tdPct);
    tbody.appendChild(tr);
  });

  // 3. Add Summary Row at the bottom
  const summaryTr = document.createElement('tr');
  summaryTr.className = 'summary-row';
  
  const summaryLabelTd = document.createElement('td');
  summaryLabelTd.className = 'habit-info-col';
  summaryLabelTd.textContent = 'Daily Score';
  summaryTr.appendChild(summaryLabelTd);

  let totalMonthChecked = 0;
  
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = getFormattedDateKey(state.profile.year, state.profile.month, d);
    let dailyCompleted = 0;
    
    activeHabits.forEach(h => {
      if (h.history[dateKey] === 'completed') dailyCompleted++;
    });
    
    const dailyPct = activeHabits.length > 0 ? Math.round((dailyCompleted / activeHabits.length) * 100) : 0;
    totalMonthChecked += dailyCompleted;
    
    const summaryCell = document.createElement('td');
    summaryCell.textContent = `${dailyPct}%`;
    summaryCell.style.fontSize = '0.75rem';
    
    if (isCurrentMonthYear && d === todayDateNum) {
      summaryCell.classList.add('today-col');
    }
    
    summaryTr.appendChild(summaryCell);
  }

  // Grand summary rate
  const grandTotalPossible = activeHabits.length * daysInMonth;
  const grandPct = grandTotalPossible > 0 ? Math.round((totalMonthChecked / grandTotalPossible) * 100) : 0;
  
  const grandPctTd = document.createElement('td');
  grandPctTd.className = 'summary-col';
  grandPctTd.textContent = `${grandPct}%`;
  summaryTr.appendChild(grandPctTd);
  
  tbody.appendChild(summaryTr);
}

// Cycles completion status of a clicked grid cell: untracked -> completed -> missed -> untracked
function cycleCellStatus(habitId, dateKey) {
  // Guard against future dates
  const parts = dateKey.split('-');
  const yVal = parseInt(parts[0]);
  const mVal = parseInt(parts[1]) - 1;
  const dVal = parseInt(parts[2]);
  const checkDate = new Date(yVal, mVal, dVal);
  const todayCompare = new Date();
  todayCompare.setHours(0, 0, 0, 0);
  checkDate.setHours(0, 0, 0, 0);
  if (checkDate > todayCompare) {
    showToast("Cannot log progress for future dates.", "warning");
    return;
  }

  const habit = state.habits.find(h => h.id === habitId);
  if (!habit) return;

  const current = habit.history[dateKey];
  let nextStatus = null;
  let xpDiff = 0;

  if (!current) {
    nextStatus = 'completed';
    xpDiff = 10;
  } else if (current === 'completed') {
    nextStatus = 'missed';
    xpDiff = -15; // -10 from removal, -5 from penalty
  } else if (current === 'missed') {
    nextStatus = null;
    xpDiff = 5; // remove penalty
  }

  habit.history[dateKey] = nextStatus;
  if (!nextStatus) {
    delete habit.history[dateKey];
  }

  // Adjust XP and Level
  adjustXP(xpDiff);
  
  // Post-update verification checks (Badge calculations)
  checkCompletionsBadges(habit, dateKey, nextStatus);

  saveState();
  
  // Re-render
  renderMonthlyTrackerGrid();
  
  // Level check
  document.getElementById('header-level').textContent = state.profile.level;
}

// Gamification XP system details
function adjustXP(amount) {
  let xp = state.profile.xp + amount;
  if (xp < 0) xp = 0;
  
  const prevLevel = state.profile.level;
  const nextLevel = Math.floor(xp / 100) + 1;
  
  state.profile.xp = xp;
  
  if (nextLevel > prevLevel) {
    state.profile.level = nextLevel;
    showToast(`🎉 LEVEL UP! You reached Level ${nextLevel}! Keep it up.`, "success");
    // Extra visual fireworks check or sound
  } else if (nextLevel < prevLevel) {
    state.profile.level = nextLevel;
  }
}

// ==================== 7. VIEW BUILDER: WEEKLY VIEW ====================
function renderWeeklyViewGrid() {
  const table = document.getElementById('weekly-grid-table');
  const thead = table.querySelector('thead');
  const tbody = table.querySelector('tbody');
  
  thead.innerHTML = '';
  tbody.innerHTML = '';
  
  const activeHabits = state.habits.filter(h => h.active);
  if (activeHabits.length === 0) {
    thead.innerHTML = '<tr><th>Weekly Tracking Matrix</th></tr>';
    tbody.innerHTML = '<tr><td class="text-center padding-md subtitle-text text-muted">Create active habits in the Habit List tab to view the weekly focused grid.</td></tr>';
    return;
  }

  const today = new Date();
  const currentDayOfWeek = today.getDay(); 
  const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  const monday = new Date();
  monday.setDate(today.getDate() + distanceToMonday);

  // 1. Build Headers
  const headerTr = document.createElement('tr');
  const headerInfo = document.createElement('th');
  headerInfo.textContent = 'Weekly Routine';
  headerInfo.className = 'weekly-habit-info';
  headerTr.appendChild(headerInfo);

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekDates = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDates.push(d);

    const th = document.createElement('th');
    th.className = 'weekly-day-col';
    th.innerHTML = `${dayNames[i]}<br><span style="font-size:0.75rem; font-weight:normal;">${d.getDate()} ${d.toLocaleString(undefined, {month: 'short'})}</span>`;
    
    if (d.toDateString() === today.toDateString()) {
      th.style.color = 'var(--accent-color)';
      th.style.fontWeight = 'bold';
    }
    headerTr.appendChild(th);
  }
  thead.appendChild(headerTr);

  // 2. Build Habit Rows
  activeHabits.forEach(habit => {
    const tr = document.createElement('tr');
    
    const tdInfo = document.createElement('td');
    tdInfo.className = 'weekly-habit-info';
    tdInfo.innerHTML = `<span style="border-left: 3px solid ${habit.color}; padding-left: 6px; font-weight:600;">${habit.name}</span><br><span class="subtitle-text" style="font-size:0.75rem;">${habit.category}</span>`;
    tr.appendChild(tdInfo);

    weekDates.forEach(date => {
      const td = document.createElement('td');
      const dateKey = getFormattedDateKey(date.getFullYear(), date.getMonth(), date.getDate());
      const status = habit.history[dateKey];
      
      const checkbox = document.createElement('div');
      checkbox.className = 'weekly-cell-checkbox';
      
      if (status === 'completed') {
        checkbox.classList.add('completed');
        checkbox.textContent = '✓';
      } else if (status === 'missed') {
        checkbox.classList.add('missed');
        checkbox.textContent = '✕';
      }
      
      // Check if this date is in the future
      const checkDate = new Date(date);
      const todayCompare = new Date();
      todayCompare.setHours(0, 0, 0, 0);
      checkDate.setHours(0, 0, 0, 0);
      const isFuture = checkDate > todayCompare;

      if (isFuture) {
        checkbox.classList.add('future-cell');
        checkbox.title = "Future date - tracking locked";
      } else {
        checkbox.addEventListener('click', () => {
          cycleCellStatus(habit.id, dateKey);
          renderWeeklyViewGrid(); // Re-render this view
        });
      }
      
      td.appendChild(checkbox);
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
}

// ==================== 8. VIEW BUILDER: HABITS MANAGEMENT ====================
function renderHabitList() {
  const container = document.getElementById('habits-list-grid');
  container.innerHTML = '';
  
  if (state.habits.length === 0) {
    container.innerHTML = `
      <div class="card text-center" style="grid-column: 1 / -1; padding: 40px 20px;">
        <p class="font-md margin-bottom-sm">Create your first habit!</p>
        <p class="subtitle-text margin-bottom-md">Get started by clicking the "Add Habit" button or select a preset pack above.</p>
      </div>
    `;
    return;
  }

  state.habits.forEach(habit => {
    const card = document.createElement('div');
    card.className = `card habit-card`;
    card.style.opacity = habit.active ? 1 : 0.6;
    
    // Colored top border
    card.style.setProperty('--accent-color', habit.color);
    
    // Header
    const header = document.createElement('div');
    header.className = 'habit-card-header';
    
    const titleGroup = document.createElement('div');
    titleGroup.className = 'title-group';
    
    const emoji = document.createElement('span');
    emoji.className = 'habit-category-emoji';
    emoji.textContent = habit.icon || '✨';
    
    const title = document.createElement('h4');
    title.className = 'habit-name-display';
    title.textContent = habit.name;
    title.title = habit.name;
    
    titleGroup.appendChild(emoji);
    titleGroup.appendChild(title);
    
    const priority = document.createElement('span');
    priority.className = `habit-badge-priority priority-${habit.priority.toLowerCase()}`;
    priority.textContent = habit.priority;
    
    header.appendChild(titleGroup);
    header.appendChild(priority);
    
    // Meta Row
    const meta = document.createElement('div');
    meta.className = 'habit-meta-row';
    
    const catItem = document.createElement('span');
    catItem.className = 'habit-meta-item';
    catItem.textContent = `📁 ${habit.category}`;
    
    const targetItem = document.createElement('span');
    targetItem.className = 'habit-meta-item';
    targetItem.textContent = `🎯 Target: ${habit.target}/wk`;
    
    meta.appendChild(catItem);
    meta.appendChild(targetItem);
    
    // Actions / Controls Row
    const actions = document.createElement('div');
    actions.className = 'habit-actions-row';
    
    const toggleGroup = document.createElement('label');
    toggleGroup.className = 'switch flex-align-center';
    
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = habit.active;
    input.addEventListener('change', () => {
      toggleHabitActive(habit.id, input.checked);
    });
    
    const slider = document.createElement('span');
    slider.className = 'slider';
    
    toggleGroup.appendChild(input);
    toggleGroup.appendChild(slider);
    
    const toggleLabel = document.createElement('span');
    toggleLabel.className = 'habit-toggle-status margin-left-sm';
    toggleLabel.textContent = habit.active ? 'Active' : 'Inactive';
    
    const flexToggle = document.createElement('div');
    flexToggle.className = 'flex-align-center';
    flexToggle.appendChild(toggleGroup);
    flexToggle.appendChild(toggleLabel);
    
    const controls = document.createElement('div');
    controls.className = 'habit-controls';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'action-icon-btn edit';
    editBtn.title = 'Edit Habit';
    editBtn.innerHTML = `<svg viewBox="0 0 24 24" class="action-icon"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`;
    editBtn.addEventListener('click', () => openEditHabitModal(habit));
    
    const delBtn = document.createElement('button');
    delBtn.className = 'action-icon-btn delete';
    delBtn.title = 'Delete Habit';
    delBtn.innerHTML = `<svg viewBox="0 0 24 24" class="action-icon"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`;
    delBtn.addEventListener('click', () => deleteHabit(habit.id));
    
    controls.appendChild(editBtn);
    controls.appendChild(delBtn);
    
    actions.appendChild(flexToggle);
    actions.appendChild(controls);
    
    card.appendChild(header);
    card.appendChild(meta);
    card.appendChild(actions);
    
    container.appendChild(card);
  });
}

function toggleHabitActive(habitId, activeState) {
  const habit = state.habits.find(h => h.id === habitId);
  if (habit) {
    habit.active = activeState;
    saveState();
    renderHabitList();
    showToast(`Habit "${habit.name}" marked as ${activeState ? 'Active' : 'Inactive'}.`, "info");
  }
}

// Preset pack addition handler
function setupTemplates() {
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.getAttribute('data-preset');
      const routine = PRESET_ROUTINES[presetKey];
      
      if (routine) {
        let addedCount = 0;
        routine.forEach(item => {
          // Check if habit already exists to prevent duplicate spam
          const duplicate = state.habits.find(h => h.name.toLowerCase() === item.name.toLowerCase());
          if (!duplicate) {
            state.habits.push({
              id: generateUUID(),
              name: item.name,
              category: item.category,
              color: item.color,
              icon: CATEGORY_ICONS[item.category] || '✨',
              target: item.target,
              priority: item.priority,
              active: true,
              history: {}
            });
            addedCount++;
          }
        });
        
        if (addedCount > 0) {
          unlockBadge('first-habit');
          saveState();
          renderHabitList();
          showToast(`Added ${addedCount} habits from the Routine Pack!`, "success");
        } else {
          showToast(`Preset habits already exist in your routine.`, "warning");
        }
      }
    });
  });
}

// Modal handling logic
function setupModals() {
  const modal = document.getElementById('habit-modal');
  const addBtn = document.getElementById('add-habit-btn');
  const mobileAddBtn = document.getElementById('mobile-add-btn');
  const closeBtn = document.getElementById('close-modal-btn');
  const cancelBtn = document.getElementById('cancel-modal-btn');
  const form = document.getElementById('habit-form');
  const deleteBtn = document.getElementById('delete-habit-modal-btn');

  const openModal = () => {
    form.reset();
    document.getElementById('habit-id-input').value = '';
    document.getElementById('modal-title').textContent = 'Add New Habit';
    document.getElementById('habit-color').value = '#8a2be2';
    deleteBtn.classList.add('hidden');
    modal.classList.add('active');
  };

  const closeModal = () => {
    modal.classList.remove('active');
  };

  if (addBtn) addBtn.addEventListener('click', openModal);
  if (mobileAddBtn) mobileAddBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  // Category Icon change auto helper
  document.getElementById('habit-category').addEventListener('change', (e) => {
    // Preset dynamic color based on category to make UX seamless
    const colorMap = {
      Water: '#1e90ff',
      Fitness: '#ff4500',
      Sleep: '#8a2be2',
      Health: '#ff1493',
      Study: '#008080',
      Meditation: '#4caf50',
      Reading: '#3f51b5'
    };
    const val = e.target.value;
    if (colorMap[val]) {
      document.getElementById('habit-color').value = colorMap[val];
    }
  });

  // Save/Edit action
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('habit-id-input').value;
    const name = document.getElementById('habit-name').value.trim();
    const category = document.getElementById('habit-category').value;
    const priority = document.getElementById('habit-priority').value;
    const target = parseInt(document.getElementById('habit-target').value);
    const color = document.getElementById('habit-color').value;
    const active = document.getElementById('habit-active-checkbox').checked;

    if (!name) return;

    if (id) {
      // Edit
      const habit = state.habits.find(h => h.id === id);
      if (habit) {
        habit.name = name;
        habit.category = category;
        habit.priority = priority;
        habit.target = target;
        habit.color = color;
        habit.icon = CATEGORY_ICONS[category] || '✨';
        habit.active = active;
        showToast(`Habit "${name}" updated.`, "success");
      }
    } else {
      // Add
      const newHabit = {
        id: generateUUID(),
        name: name,
        category: category,
        color: color,
        icon: CATEGORY_ICONS[category] || '✨',
        target: target,
        priority: priority,
        active: active,
        history: {}
      };
      state.habits.push(newHabit);
      unlockBadge('first-habit');
      showToast(`Habit "${name}" created successfully.`, "success");
    }

    saveState();
    closeModal();
    renderHabitList();
  });

  // Modal delete action
  deleteBtn.addEventListener('click', () => {
    const id = document.getElementById('habit-id-input').value;
    if (id && confirm("Are you sure you want to delete this habit and all its history?")) {
      deleteHabit(id);
      closeModal();
    }
  });
}

function openEditHabitModal(habit) {
  const modal = document.getElementById('habit-modal');
  const form = document.getElementById('habit-form');
  const deleteBtn = document.getElementById('delete-habit-modal-btn');

  document.getElementById('habit-id-input').value = habit.id;
  document.getElementById('modal-title').textContent = 'Edit Habit';
  document.getElementById('habit-name').value = habit.name;
  document.getElementById('habit-category').value = habit.category;
  document.getElementById('habit-priority').value = habit.priority;
  document.getElementById('habit-target').value = habit.target;
  document.getElementById('habit-color').value = habit.color;
  document.getElementById('habit-active-checkbox').checked = habit.active;

  deleteBtn.classList.remove('hidden');
  modal.classList.add('active');
}

function deleteHabit(id) {
  const index = state.habits.findIndex(h => h.id === id);
  if (index !== -1) {
    const name = state.habits[index].name;
    state.habits.splice(index, 1);
    
    // Recalculate and update
    recalculateXPAndBadges();
    saveState();
    
    // Refresh header level display
    document.getElementById('header-level').textContent = state.profile.level;
    
    renderHabitList();
    showToast(`Habit "${name}" has been deleted.`, "info");
  }
}

// ==================== 9. VIEW BUILDER: ANALYTICS & CHARTS ====================
function renderAnalytics() {
  const activeHabits = state.habits.filter(h => h.active);
  const daysInMonth = getDaysInMonth(state.profile.month, state.profile.year);
  
  if (activeHabits.length === 0) {
    document.getElementById('anal-best-habit').textContent = 'None';
    document.getElementById('anal-best-rate').textContent = '0% completion rate';
    document.getElementById('anal-weakest-habit').textContent = 'None';
    document.getElementById('anal-weakest-rate').textContent = '0% completion rate';
    document.getElementById('anal-overall-rate').textContent = '0%';
    document.getElementById('anal-total-checks').textContent = '0 check-ins this month';
    // Clear charts
    destroyAllCharts();
    return;
  }

  // 1. Calculate stats metrics
  let totalPossibleChecks = 0;
  let totalCompletions = 0;
  let totalMisses = 0;
  let totalUntracked = 0;

  const habitPerformance = activeHabits.map(h => {
    let completed = 0;
    let missed = 0;
    let untracked = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const k = getFormattedDateKey(state.profile.year, state.profile.month, d);
      const status = h.history[k];
      totalPossibleChecks++;
      
      if (status === 'completed') {
        completed++;
        totalCompletions++;
      } else if (status === 'missed') {
        missed++;
        totalMisses++;
      } else {
        untracked++;
        totalUntracked++;
      }
    }
    const rate = daysInMonth > 0 ? Math.round((completed / daysInMonth) * 100) : 0;
    return {
      habit: h,
      completedRate: rate
    };
  });

  // Sort metrics
  habitPerformance.sort((a, b) => b.completedRate - a.completedRate);
  
  const best = habitPerformance[0];
  const weakest = habitPerformance[habitPerformance.length - 1];
  const overallRate = totalPossibleChecks > 0 ? Math.round((totalCompletions / totalPossibleChecks) * 100) : 0;

  document.getElementById('anal-best-habit').textContent = best.habit.name;
  document.getElementById('anal-best-rate').textContent = `${best.completedRate}% completion rate`;
  document.getElementById('anal-weakest-habit').textContent = weakest.habit.name;
  document.getElementById('anal-weakest-rate').textContent = `${weakest.completedRate}% completion rate`;
  document.getElementById('anal-overall-rate').textContent = `${overallRate}%`;
  document.getElementById('anal-total-checks').textContent = `${totalCompletions} check-ins this month`;

  // 2. Load Charts
  setTimeout(() => {
    buildDailyBarChart(activeHabits, daysInMonth);
    buildWeeklyLineChart(activeHabits);
    buildCategoryRadarChart(activeHabits, daysInMonth);
    buildDonutRatioChart(totalCompletions, totalMisses, totalUntracked);
  }, 100);
}

function destroyAllCharts() {
  Object.keys(charts).forEach(cKey => {
    if (charts[cKey]) {
      charts[cKey].destroy();
      charts[cKey] = null;
    }
  });
}

function buildDailyBarChart(activeHabits, daysInMonth) {
  if (charts.daily) charts.daily.destroy();
  
  const ctx = document.getElementById('dailyChart').getContext('2d');
  const labels = [];
  const datasetData = [];

  for (let d = 1; d <= daysInMonth; d++) {
    labels.push(d);
    const dateKey = getFormattedDateKey(state.profile.year, state.profile.month, d);
    let dailyCompleted = 0;
    activeHabits.forEach(h => {
      if (h.history[dateKey] === 'completed') dailyCompleted++;
    });
    const pct = activeHabits.length > 0 ? Math.round((dailyCompleted / activeHabits.length) * 100) : 0;
    datasetData.push(pct);
  }

  charts.daily = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Completion Rate (%)',
        data: datasetData,
        backgroundColor: 'rgba(138, 43, 226, 0.4)',
        borderColor: 'rgba(138, 43, 226, 0.8)',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { callback: value => `${value}%` }
        }
      }
    }
  });
}

function buildWeeklyLineChart(activeHabits) {
  if (charts.weekly) charts.weekly.destroy();
  
  const ctx = document.getElementById('weeklyChart').getContext('2d');
  
  // Calculate average completion rate for past 4 calendar weeks in active month
  // Split month into 4 segments roughly
  const daysInMonth = getDaysInMonth(state.profile.month, state.profile.year);
  const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  const weekSize = Math.floor(daysInMonth / 4);
  const datasets = [];

  // Overall compliance rate line
  const overallWeekly = [];
  for (let w = 0; w < 4; w++) {
    const startDay = w * weekSize + 1;
    const endDay = w === 3 ? daysInMonth : (w + 1) * weekSize;
    let possible = 0;
    let completed = 0;
    
    activeHabits.forEach(h => {
      for (let d = startDay; d <= endDay; d++) {
        const k = getFormattedDateKey(state.profile.year, state.profile.month, d);
        possible++;
        if (h.history[k] === 'completed') completed++;
      }
    });
    const pct = possible > 0 ? Math.round((completed / possible) * 100) : 0;
    overallWeekly.push(pct);
  }

  charts.weekly = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Overall Progress',
        data: overallWeekly,
        borderColor: '#ff1493',
        backgroundColor: 'rgba(255, 20, 147, 0.1)',
        fill: true,
        tension: 0.3,
        borderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { callback: value => `${value}%` }
        }
      }
    }
  });
}

function buildCategoryRadarChart(activeHabits, daysInMonth) {
  if (charts.category) charts.category.destroy();
  
  const ctx = document.getElementById('categoryChart').getContext('2d');
  
  // Map category completions
  const categoryData = {};
  activeHabits.forEach(h => {
    if (!categoryData[h.category]) {
      categoryData[h.category] = { possible: 0, completed: 0 };
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const k = getFormattedDateKey(state.profile.year, state.profile.month, d);
      categoryData[h.category].possible++;
      if (h.history[k] === 'completed') {
        categoryData[h.category].completed++;
      }
    }
  });

  const labels = Object.keys(categoryData);
  const data = labels.map(l => {
    const item = categoryData[l];
    return item.possible > 0 ? Math.round((item.completed / item.possible) * 100) : 0;
  });

  // Radar or Bar as fallback if categories count < 3 (radar looks empty with 2 items)
  const chartType = labels.length >= 3 ? 'radar' : 'bar';

  charts.category = new Chart(ctx, {
    type: chartType,
    data: {
      labels: labels,
      datasets: [{
        label: 'Category Performance (%)',
        data: data,
        backgroundColor: 'rgba(0, 128, 128, 0.2)',
        borderColor: 'rgba(0, 128, 128, 0.8)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(0, 128, 128, 1)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: chartType === 'radar' ? {
        r: {
          angleLines: { display: true },
          suggestedMin: 0,
          suggestedMax: 100
        }
      } : {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });
}

function buildDonutRatioChart(completed, missed, untracked) {
  if (charts.donut) charts.donut.destroy();
  
  const ctx = document.getElementById('donutChart').getContext('2d');
  
  charts.donut = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Completed', 'Missed', 'Untracked'],
      datasets: [{
        data: [completed, missed, untracked],
        backgroundColor: [
          '#10b981', // green
          '#ef4444', // red
          'rgba(166, 143, 174, 0.15)' // muted gray background
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

// ==================== 10. VIEW BUILDER: SETTINGS & BACKUP ====================
function loadSettingsPanel() {
  document.getElementById('settings-username').value = state.profile.name;
  
  // Re-run visual theme bindings to ensure setting dots match current state
  applyVisualThemeSettings();
}

function setupSettings() {
  const profileForm = document.getElementById('settings-profile-form');
  
  profileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('settings-username').value.trim();
    
    if (name) {
      state.profile.name = name;
      saveState();
      initializeApplication();
      showToast("Profile settings updated successfully.", "success");
    }
  });

  // Accent selector click handlers
  document.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const color = dot.getAttribute('data-color');
      localStorage.setItem('trackkar_accent', color);
      applyVisualThemeSettings();
      showToast(`Accent theme updated.`, "success");
    });
  });



  // BACKUP DATA (Export JSON)
  document.getElementById('btn-export-json').addEventListener('click', () => {
    const filename = `trackkar_backup_${new Date().toISOString().slice(0, 10)}.json`;
    const jsonStr = JSON.stringify(state, null, 2);
    downloadFile(jsonStr, 'application/json', filename);
    showToast("JSON backup downloaded successfully.", "success");
  });

  // RESTORE BACKUP (Import JSON)
  document.getElementById('import-json-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported.profile && Array.isArray(imported.habits)) {
          state = imported;
          saveState();
          initializeApplication();
          showToast("Backup state restored successfully!", "success");
        } else {
          showToast("Invalid backup file format. Could not restore.", "danger");
        }
      } catch (err) {
        showToast("Error parsing file. Ensure it is a valid JSON backup.", "danger");
      }
    };
    reader.readAsText(file);
    // Reset file input value so same file can be reloaded if needed
    e.target.value = '';
  });

  // EXPORT MONTH TO CSV
  document.getElementById('btn-export-csv').addEventListener('click', () => {
    const csvContent = generateMonthCSV();
    const filename = `trackkar_report_${state.profile.year}_${state.profile.month + 1}.csv`;
    downloadFile(csvContent, 'text/csv;charset=utf-8;', filename);
    showToast("Monthly CSV spreadsheet exported successfully.", "success");
  });

  // PRINT REPORT
  document.getElementById('btn-print-dashboard').addEventListener('click', () => {
    window.print();
  });

  // DANGER ZONE Actions
  document.getElementById('btn-reset-month').addEventListener('click', () => {
    if (confirm("WARNING: This will delete ALL checked box progress for the current month! Active habits will remain. Do you want to proceed?")) {
      const days = getDaysInMonth(state.profile.month, state.profile.year);
      state.habits.forEach(h => {
        for (let d = 1; d <= days; d++) {
          const k = getFormattedDateKey(state.profile.year, state.profile.month, d);
          delete h.history[k];
        }
      });
      
      // Recalculate XP, Level, and Badges based on remaining history
      recalculateXPAndBadges();
      saveState();
      initializeApplication();
      showToast("Current month tracking progress has been reset.", "warning");
    }
  });

  document.getElementById('btn-clear-all').addEventListener('click', () => {
    if (confirm("CRITICAL WARNING: This will WIPE the entire local storage database and restart the onboarding process. Are you absolutely sure?")) {
      localStorage.removeItem(DB_KEY);
      localStorage.removeItem('trackkar_accent');
      localStorage.removeItem('trackkar_theme');
      location.reload();
    }
  });
}

// Generates CSV format representing Excel grid
function generateMonthCSV() {
  const daysInMonth = getDaysInMonth(state.profile.month, state.profile.year);
  const activeHabits = state.habits.filter(h => h.active);
  
  let csv = 'Habit Name,Category,Priority,Target';
  for (let d = 1; d <= daysInMonth; d++) {
    csv += `,Day ${d}`;
  }
  csv += ',Completion %\r\n';

  activeHabits.forEach(h => {
    let rowPct = 0;
    let completed = 0;
    csv += `"${h.name.replace(/"/g, '""')}","${h.category}","${h.priority}",${h.target}`;
    for (let d = 1; d <= daysInMonth; d++) {
      const k = getFormattedDateKey(state.profile.year, state.profile.month, d);
      const status = h.history[k];
      if (status === 'completed') {
        csv += ',Completed';
        completed++;
      } else if (status === 'missed') {
        csv += ',Missed';
      } else {
        csv += ',';
      }
    }
    rowPct = daysInMonth > 0 ? Math.round((completed / daysInMonth) * 100) : 0;
    csv += `,${rowPct}%\r\n`;
  });

  return csv;
}

function downloadFile(content, contentType, filename) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ==================== 11. GAMIFICATION ENGINE DETAILS ====================
// Runs validation checks on completed items to unlock badges
function checkCompletionsBadges(habit, dateKey, newStatus) {
  const activeHabits = state.habits.filter(h => h.active);
  if (activeHabits.length === 0) return;

  // 1. First Habit check
  unlockBadge('first-habit');

  // 2. Streaks checks (3, 7, 15, 30 days)
  const streaks = calculateStreaks(habit);
  if (streaks.current >= 30) unlockBadge('streak-30');
  else if (streaks.current >= 15) unlockBadge('streak-15');
  else if (streaks.current >= 7) unlockBadge('streak-7');
  else if (streaks.current >= 3) unlockBadge('streak-3');

  // 3. Perfect Day check
  // Check if all active habits are completed on this specific dateKey
  let perfect = true;
  for (let i = 0; i < activeHabits.length; i++) {
    if (activeHabits[i].history[dateKey] !== 'completed') {
      perfect = false;
      break;
    }
  }
  if (perfect) {
    unlockBadge('perfect-day');
    // Earn extra perfect day XP
    if (newStatus === 'completed') {
      adjustXP(50); // Bonus 50 XP
      showToast("🌟 PERFECT DAY! All active habits completed today. +50 XP bonus!", "success");
    }
  }

  // 4. Comeback check
  // Check if history before this dateKey had at least 3 consecutive misses, and now it is completed
  if (newStatus === 'completed') {
    const parts = dateKey.split('-');
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);
    const clickedDate = new Date(year, month, day);

    let consecutiveMisses = 0;
    for (let i = 1; i <= 4; i++) {
      const prevDate = new Date(clickedDate);
      prevDate.setDate(clickedDate.getDate() - i);
      const prevKey = getFormattedDateKey(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate());
      if (habit.history[prevKey] === 'missed') {
        consecutiveMisses++;
      } else {
        break;
      }
    }
    if (consecutiveMisses >= 3) {
      unlockBadge('comeback');
      adjustXP(20); // Comeback XP
      showToast("🔥 COMEBACK LEGEND! Broke a miss-streak with a completion. +20 XP!", "success");
    }
  }
}

function unlockBadge(badgeId) {
  if (!state.badges.includes(badgeId)) {
    state.badges.push(badgeId);
    const bDef = BADGE_REGISTRY[badgeId];
    if (bDef) {
      showToast(`🏆 BADGE UNLOCKED: "${bDef.name}" - ${bDef.desc}`, "success");
    }
  }
}

// Streak Calculator
// If active month is not current calendar, calculate streaks relative to the last day of the active month.
// If active month is current calendar, calculate relative to today.
function calculateStreaks(habit) {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  let targetDate = new Date(); // Start calculations here

  if (state.profile.month !== currentMonth || state.profile.year !== currentYear) {
    // Relative to the last day of the active month
    const lastDay = getDaysInMonth(state.profile.month, state.profile.year);
    targetDate = new Date(state.profile.year, state.profile.month, lastDay);
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  // Calculate longest streak historically in the current active month
  const daysInMonth = getDaysInMonth(state.profile.month, state.profile.year);
  for (let d = 1; d <= daysInMonth; d++) {
    const k = getFormattedDateKey(state.profile.year, state.profile.month, d);
    if (habit.history[k] === 'completed') {
      tempStreak++;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    } else {
      tempStreak = 0;
    }
  }

  // Calculate current streak iterating backwards from targetDate
  let iterDate = new Date(targetDate);
  const maxIterations = 365; // Safety cap
  let count = 0;
  
  // If targetDate is today and today is not completed, check if yesterday was completed.
  // This keeps the streak alive today until the day is over.
  const todayKey = getFormattedDateKey(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  
  if (habit.history[todayKey] !== 'completed') {
    iterDate.setDate(targetDate.getDate() - 1);
  }

  while (count < maxIterations) {
    const k = getFormattedDateKey(iterDate.getFullYear(), iterDate.getMonth(), iterDate.getDate());
    
    // Only check dates within active month scope to keep it focused
    if (iterDate.getMonth() !== state.profile.month || iterDate.getFullYear() !== state.profile.year) {
      break;
    }

    if (habit.history[k] === 'completed') {
      currentStreak++;
    } else {
      break;
    }

    iterDate.setDate(iterDate.getDate() - 1);
    count++;
  }

  return {
    current: currentStreak,
    longest: longestStreak
  };
}

function getLongestStreakAllTime(habit) {
  const completedKeys = Object.entries(habit.history)
    .filter(([_, status]) => status === 'completed')
    .map(([dateKey, _]) => dateKey)
    .sort();

  if (completedKeys.length === 0) return 0;

  let longest = 0;
  let current = 0;
  let prevTime = null;

  for (let i = 0; i < completedKeys.length; i++) {
    const parts = completedKeys[i].split('-');
    const currDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const currTime = currDate.getTime();

    if (prevTime === null) {
      current = 1;
    } else {
      const diffTime = currTime - prevTime;
      const oneDayMs = 24 * 60 * 60 * 1000;
      const diffDays = Math.round(diffTime / oneDayMs);
      if (diffDays === 1) {
        current++;
      } else if (diffDays > 1) {
        current = 1;
      }
    }
    if (current > longest) longest = current;
    prevTime = currTime;
  }

  return longest;
}

function recalculateXPAndBadges() {
  let xp = 0;
  let badges = [];

  if (state.habits.length === 0) {
    state.profile.xp = 0;
    state.profile.level = 1;
    state.badges = [];
    return;
  }

  // 1. First Step badge
  badges.push('first-habit');

  // Let's gather all unique dates across all habits histories
  const allDates = new Set();
  state.habits.forEach(habit => {
    Object.keys(habit.history).forEach(dateKey => {
      allDates.add(dateKey);
    });
  });

  const activeHabits = state.habits.filter(h => h.active);

  // We need to calculate base XP from completions and misses, plus perfect days and comebacks.
  state.habits.forEach(habit => {
    // Basic history XP
    Object.entries(habit.history).forEach(([dateKey, status]) => {
      if (status === 'completed') {
        xp += 10;
      } else if (status === 'missed') {
        xp -= 5;
      }
    });

    // Check for comeback legend
    const completedDates = Object.entries(habit.history)
      .filter(([_, status]) => status === 'completed')
      .map(([dateKey, _]) => dateKey);

    completedDates.forEach(dateKey => {
      const parts = dateKey.split('-');
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const day = parseInt(parts[2]);
      const clickedDate = new Date(year, month, day);

      let consecutiveMisses = 0;
      for (let i = 1; i <= 3; i++) { // Check exactly the 3 days prior
        const prevDate = new Date(clickedDate);
        prevDate.setDate(clickedDate.getDate() - i);
        const prevKey = getFormattedDateKey(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate());
        if (habit.history[prevKey] === 'missed') {
          consecutiveMisses++;
        } else {
          break;
        }
      }
      if (consecutiveMisses >= 3) {
        xp += 20; // Comeback XP bonus
        if (!badges.includes('comeback')) {
          badges.push('comeback');
        }
      }
    });

    // Streaks checks for this habit
    const longestStreak = getLongestStreakAllTime(habit);
    if (longestStreak >= 30) {
      if (!badges.includes('streak-30')) badges.push('streak-30');
    }
    if (longestStreak >= 15) {
      if (!badges.includes('streak-15')) badges.push('streak-15');
    }
    if (longestStreak >= 7) {
      if (!badges.includes('streak-7')) badges.push('streak-7');
    }
    if (longestStreak >= 3) {
      if (!badges.includes('streak-3')) badges.push('streak-3');
    }
  });

  // Perfect Day checks
  if (activeHabits.length > 0) {
    allDates.forEach(dateKey => {
      let perfect = true;
      for (let i = 0; i < activeHabits.length; i++) {
        if (activeHabits[i].history[dateKey] !== 'completed') {
          perfect = false;
          break;
        }
      }
      if (perfect) {
        xp += 50; // Bonus perfect day XP
        if (!badges.includes('perfect-day')) {
          badges.push('perfect-day');
        }
      }
    });
  }

  if (xp < 0) xp = 0;
  state.profile.xp = xp;
  state.profile.level = Math.floor(xp / 100) + 1;
  state.badges = badges;
}

// ==================== 12. UTILITY & CONVERTERS ====================
function getDaysInMonth(month, year) {
  return new Date(year, month + 1, 0).getDate();
}

function getFormattedDateKey(year, month, day) {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

function generateUUID() {
  return 'h-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36).substr(-4);
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function hexToRgbComponents(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

function adjustColorBrightness(hex, percent) {
  let R = parseInt(hex.substring(1, 3), 16);
  let G = parseInt(hex.substring(3, 5), 16);
  let B = parseInt(hex.substring(5, 7), 16);

  R = parseInt(R * (100 + percent) / 100);
  G = parseInt(G * (100 + percent) / 100);
  B = parseInt(B * (100 + percent) / 100);

  R = (R < 255) ? R : 255;
  G = (G < 255) ? G : 255;
  B = (B < 255) ? B : 255;

  R = (R > 0) ? R : 0;
  G = (G > 0) ? G : 0;
  B = (B > 0) ? B : 0;

  const rHex = R.toString(16).padStart(2, '0');
  const gHex = G.toString(16).padStart(2, '0');
  const bHex = B.toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}

// Custom Toast notifications manager
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const iconMap = {
    success: '🎉',
    danger: '❌',
    warning: '⚠️',
    info: '💡'
  };

  const emoji = iconMap[type] || '🔔';
  
  toast.innerHTML = `
    <span style="font-size: 1.2rem;">${emoji}</span>
    <div class="toast-message">${message}</div>
    <span class="toast-close">&times;</span>
  `;

  // Close binding
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.classList.add('fade-out');
    toast.addEventListener('animationend', () => toast.remove());
  });

  container.appendChild(toast);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.add('fade-out');
      toast.addEventListener('animationend', () => toast.remove());
    }
  }, 5000);
}

// ==================== 13. PWA SETUP & OFFLINE SERVICE WORKER ====================
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js')
        .then(reg => {
          console.log('[Service Worker] Registered successfully.', reg.scope);
        })
        .catch(err => {
          console.error('[Service Worker] Registration failed:', err);
        });
    });
  }

  // Handle PWA Install prompting
  let deferredPrompt;
  const installBtn = document.getElementById('pwa-install-btn');

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent default mini-infobar on mobile chrome
    e.preventDefault();
    deferredPrompt = e;
    
    // Unhide install button
    if (installBtn) {
      installBtn.classList.remove('hidden');
    }
  });

  if (installBtn) {
    installBtn.addEventListener('click', () => {
      if (!deferredPrompt) return;
      
      // Hide button
      installBtn.classList.add('hidden');
      
      // Show prompt
      deferredPrompt.prompt();
      
      // Wait for response
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the PWA install prompt');
          showToast("Thank you for installing Trackkar!", "success");
        } else {
          console.log('User dismissed the PWA install prompt');
        }
        deferredPrompt = null;
      });
    });
  }

  // Handle installed state
  window.addEventListener('appinstalled', (evt) => {
    console.log('Trackkar was installed successfully.');
    showToast("Trackkar installed successfully! Run it from your home screen.", "success");
    if (installBtn) installBtn.classList.add('hidden');
  });
}
