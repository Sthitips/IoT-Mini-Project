# 📱 AgroPulse — Frontend Dashboard

A modern, responsive web dashboard built with **React 19**, **Vite**, and **Tailwind CSS**. It visualizes real-time soil moisture telemetry, historical moisture trends, and irrigation recommendations received from the FastAPI backend.

---

## 🎨 UI Features

- **Soil Moisture Circular Gauge:** Real-time SVG circular meter indicating current volumetric water content (0–100%).
- **Moisture Zone Spectrum:** Color-coded 4-segment spectrum gauge (Dry, Moderate, Optimal, Saturated) with a dynamic pointer.
- **Automated Irrigation Advisory:** Smart dosage recommendations, timing tips, and watering best-practice checklist.
- **Historical Moisture Trend Chart:** Interactive Recharts area chart with normalized local timestamps and hover tooltips.
- **Live Telemetry Log:** Switchable table view displaying timestamped historical records with health badges.
- **Auto-Sync & Cache Busting:** Automatically polls the backend every 3 seconds with HTTP cache-busting headers.
- **Mobile Responsive:** Fluid layout with safe-area padding for mobile browsers and desktop monitors.

---

## 📁 Directory Structure

```text
soil-monitor-frontend/
├── src/
│   ├── api/
│   │   ├── axios.js           # Axios instance with cache-busting interceptor
│   │   └── sensorApi.js       # Backend REST API query functions
│   ├── components/
│   │   ├── MoistureCard.jsx   # Live moisture circular progress gauge
│   │   ├── MoistureLevel.jsx  # Multi-segment moisture spectrum bar
│   │   ├── Recommendation.jsx # Watering dosage & irrigation advice
│   │   └── RecentReadings.jsx # Recharts trend line & chronological log
│   ├── hooks/
│   │   └── useSensorData.js   # 3-second auto-polling custom hook
│   ├── pages/
│   │   └── Dashboard.jsx      # Main dashboard shell & navigation header
│   ├── App.css                # Custom card glassmorphism & live animations
│   ├── index.css              # Tailwind base utilities & scrollbars
│   ├── App.jsx                # Root React component
│   └── main.jsx               # React DOM entry point
├── public/                    # Static public assets
├── package.json               # Dependencies and build scripts
├── vercel.json                # Single-Page-Application rewrite rules
└── vite.config.js             # Vite development server and /api proxy configuration
```

---

## 🚀 Local Development

### 1. Install Dependencies
```bash
cd soil-monitor-frontend
npm install
```

### 2. Start Vite Dev Server
```bash
npm run dev -- --host 0.0.0.0 --port 5173
```

- Local URL: `http://localhost:5173`
- Network URL: `http://<your-lan-ip>:5173` (accessible on phone connected to same Wi-Fi)

> During local development, Vite automatically proxies all requests from `/api/*` to `http://127.0.0.1:8000/*`.

---

## ☁️ Production Deployment (Vercel)

The frontend is ready for zero-config deployment on **Vercel**:

1. Push your repository to **GitHub**.
2. Go to **[https://vercel.com](https://vercel.com)** → **Add New...** → **Project**.
3. Import your GitHub repository.
4. Set:
   - **Root Directory:** `soil-monitor-frontend`
   - **Framework Preset:** `Vite`
5. Add the Environment Variable:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://your-backend-name.onrender.com/api`
6. Click **Deploy**.

---

## 🛠️ Available Scripts

```bash
npm run dev      # Start Vite development server
npm run build    # Compile production bundle into dist/
npm run lint     # Run ESLint validation checks
npm run preview  # Preview production build locally
```

