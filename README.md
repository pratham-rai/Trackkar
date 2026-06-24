# Trackkar – Visual Habit Tracker

**Trackkar** is a premium, client-side, visual habit tracking web application designed to model the structure of popular Excel/Google Sheets habit-tracking matrices with a modern, gamified, and responsive SaaS dashboard layout. 

Built using pure HTML, CSS, and Vanilla JavaScript, the application operates entirely offline as a Progressive Web App (PWA) using `localStorage` for complete data privacy.

---

## 🎯 Features

1. **User Onboarding Flow**
   - Welcomes new users and collects names, tracking periods, and target themes.
   - Pre-populates relevant habit lists based on chosen themes (Fitness, Study, Productivity, Job Search, etc.).

2. **Unified Routine Tracker**
   - Consolidates Monthly Grid and Weekly Focus checklist into a single view.
   - Includes a toggle switch to dynamically swap between the Monthly spreadsheet matrix and the Weekly checklist planner.
   - Features clickable 1–31 grid cell matrices for the active month and Mon-Sun checklists.
   - Highlights active date columns and automatically locks future dates.

4. **Routine & Habit Management**
   - Add, edit, delete, and temporarily deactivate habits.
   - Assign priorities (Low, Medium, High), choose dynamic accent colors, and link to predefined categories with emoji badges.

5. **Gamification & Badge System**
   - **XP Engine**: Earn points for completing habits (+10 XP) and completing all habits in a day (+50 XP Perfect Day bonus). Level up automatically on every 100 XP increment.
   - **Badge Registry**: Unlock 7 custom trophies (First Step, 3/7/15-Day Streaks, 30-Day Legend, Perfect Day, and Comeback Legend).

6. **Interactive Analytics Dashboards**
   - Powered by Chart.js.
   - Visualized metrics: Daily Progress Bar Chart, Weekly Performance Line Chart, Category-wise Performance Radar Chart, and a Donut completion ratio chart.

7. **Theme and Custom Accent Customization**
   - Light and Dark modes.
   - Selection of 6 primary dashboard accent design colors (Purple, Teal, Pink, Blue, Green, Orange) which adapt the entire UI style.

8. **Backups & PDF Report Exporters**
   - Export and import your entire state data as a single JSON file.
   - Compile and download the active month spreadsheet directly to a CSV file.
   - Tailored print styling to output clean paper reports and grids via browser printing (`Ctrl + P`).

9. **Installable PWA Support**
   - Works fully offline.
   - Installable on desktop and mobile platforms with dedicated home screen shortcuts.

---

## 🛠️ Tech Stack
- **Structure**: Semantic HTML5
- **Styling**: Vanilla CSS3 (Custom properties, grid, flexbox, custom scrollbars, CSS transition animations)
- **Programming Logic**: ECMAScript 6 (Vanilla JavaScript)
- **Charts Engine**: Chart.js (CDN implementation)
- **PWA Service**: Service Worker API + Cache Storage API
- **Persistence Layer**: Web Storage API (`localStorage`)

---

## 📁 Workspace Folder Structure
```
Habbit/
├── index.html          # Core layout, modals, onboarding screen, and tabs skeleton
├── style.css           # CSS variables, visual themes, responsive rules, and print layouts
├── script.js           # Navigation controllers, streak engine, XP calculations, and exporters
├── manifest.json       # PWA manifest detailing icons, theme colors, and launch modes
├── service-worker.js   # Offline caching rules for local assets and external CDNs
├── Logo.png            # Original high-resolution application logo
├── icon-192.png        # PWA-resized 192x192 logo icon
├── icon-512.png        # PWA-resized 512x512 logo icon
└── README.md           # Documentation (this file)
```

---

## 🚀 How to Run Locally

Since the application has no backend dependencies, it can be launched directly:

1. **Direct File Load**: Double-click `index.html` to open it in any modern browser.
2. **VS Code Live Server**: Right-click `index.html` inside VS Code and select *Open with Live Server* to run the app on a local hostname (e.g., `http://127.0.0.1:5500`), which is **highly recommended** as browser security contexts on file paths (`file://`) sometimes block PWA Service Worker registrations.

---

## 📲 How to Install as a PWA
When running the application on a local server (`http://localhost` or `http://127.0.0.1`) or via HTTPS:

1. **Desktop (Chrome / Edge / Brave)**: An **Install App** button will automatically appear in the top-right header once the PWA check registers. Alternatively, click the app installation icon in the browser address bar.
2. **Mobile (Android / iOS)**: 
   - On Android Chrome, the app will display a prompt to add it to your home screen.
   - On iOS Safari, tap the **Share** button and select **Add to Home Screen**.

Once installed, the app launches in a standalone window, removing browser borders for a premium desktop app experience.

---

## 💾 How localStorage Works

Trackkar stores your entire database locally in your browser sandbox under the key `trackkar_db_state`. The state structure conforms to:

```json
{
  "profile": {
    "name": "Jane",
    "month": 5,
    "year": 2026,
    "goalTheme": "Fitness",
    "xp": 350,
    "level": 4
  },
  "habits": [
    {
      "id": "h-a1b2c3d4-1234",
      "name": "Drink 3L water",
      "category": "Water",
      "color": "#1e90ff",
      "icon": "💧",
      "target": 7,
      "priority": "High",
      "active": true,
      "history": {
        "2026-06-01": "completed",
        "2026-06-02": "missed",
        "2026-06-24": "completed"
      }
    }
  ],
  "badges": [
    "first-habit",
    "streak-3"
  ]
}
```
*Note: Because this data is sandboxed, clearing your browser cookies/history will reset your tracker. Regularly download a JSON backup from the Settings tab to safeguard your routine history.*

---

## 🔮 Future Improvements
- **Cloud Sync**: Allow users to optionally pair with a Firebase or Supabase instance to synchronize routine grids across multiple devices.
- **Push Reminders**: Integrate the Web Notifications API to send alerts when the daily log is incomplete.
- **Habit Correlations**: Add analytics insights showing correlation statistics (e.g., "On days you track *Sleep 7 hours*, your *Practice Coding* rate increases by 25%").

---

## 🏆 Credits
Created by the **Antigravity** AI pair-programmer in collaboration with Google DeepMind.
