# Soil Monitor Frontend

This folder contains the React dashboard used to display live soil moisture data from the backend.

## What it does

- fetches the latest sensor reading from the FastAPI API
- displays current moisture, health, and recommendations
- charts historical readings over time
- refreshes data automatically and on tab focus
- works from desktop and mobile browsers

## Stack

- React
- Vite
- Axios
- Recharts
- Tailwind CSS
- Lucide icons

## Local setup

```bash
cd soil-monitor-frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

Then open the app in the browser using:

- http://localhost:5173
- or the LAN IP from the same Wi-Fi network, such as http://192.168.0.103:5173

## Production build

```bash
npm run build
```

## API configuration

The frontend uses the backend URL from:

```js
src/api/axios.js
```

It defaults to the current browser host and port 8000 for the backend, so it works from a phone on the same Wi‑Fi network.

## Environment variables

You may optionally create a `.env` file like this:

```bash
VITE_API_URL=http://192.168.0.103:8000/api
```

This is useful when you want a fixed backend URL instead of using the browser host.

## GitHub push notes

Keep this folder in Git, but do not commit:

- `node_modules/`
- `dist/`
- local `.env` files
- generated preview or cache files

## Useful scripts

```bash
npm run dev
npm run build
npm run lint
```

