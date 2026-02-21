# How to Install Bethel Cell Leaders on Your Phone

This app can be installed on **Android** and **iPhone/iPad** for quick access from your home screen.

---

## Android (Chrome)

1. Open this website in **Google Chrome**
2. Tap the **⋮** menu (3 dots) in the top-right corner
3. Tap **"Add to Home screen"** or **"Install app"**
4. Tap **"Add"** or **"Install"** to confirm
5. The app icon will appear on your home screen

---

## iPhone / iPad (Safari)

1. Open this website in **Safari** (not Chrome)
2. Tap the **Share** button (square with arrow pointing up) at the bottom
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **"Add"** in the top-right
5. The app icon will appear on your home screen

---

## After Installing

- The app will open in full-screen mode (no browser bars)
- You can use it like a native app
- Data is saved in the cloud (Firebase), so you can access it from any device

---

## Requirements

- **Android**: Chrome browser, Android 5.0 or later
- **iPhone/iPad**: Safari, iOS 11.3 or later
- The website must be served over **HTTPS** (required for PWA install)

---

## Deploying for Install

To make the app installable:

1. Build the app: `npm run build`
2. Deploy the `dist` folder to a web server with HTTPS (e.g., Vercel, Netlify, Firebase Hosting)
3. Users can then install it from the deployed URL
