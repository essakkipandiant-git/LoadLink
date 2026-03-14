# LoadLink 🚛

**Live Demo:** [https://loadlink-v2z2.onrender.com](https://loadlink-v2z2.onrender.com)

LoadLink is a modern, responsive web application connecting transport vehicle drivers with shopkeepers looking to move cargo. It features a Shopify-inspired UI with a fluid floating dark mode and glassmorphism elements.

## Features ✨
* **Live Load Board**: View real-time postings of available vehicles and pending loads.
* **Smart Route Matching**: Automatically cross-reference and filter drivers matching your pickup and destination requirements.
* **Role-Based Authentication**: Separate dashboards and UI logic depending on whether you register as a *Driver* or a *Shopkeeper*.
* **Interactive Booking Engine**: Instantly express interest in a post. Notifications are routed directly to the poster's dashboard with a direct WhatsApp connection link.
* **Hardware-accelerated Aesthetic**: Soft, floating organic gradient backgrounds customized for both Light and Dark mode.

## Tech Stack 🛠️
* **Frontend**: HTML5, Vanilla CSS3 (CSS Variables for Theming), Vanilla JavaScript.
* **Backend**: Node.js, Express.js.
* **Database**: SQLite3.

## Local Installation 💻

1. **Clone the repository:**
   ```bash
   git clone https://github.com/essakkipandiant-git/LoadLink.git
   cd LoadLink
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```
   *The SQLite database (`loadlink.db`) will automatically initialize on the first run.*

4. **View the app:**
   Open your browser and navigate to `http://localhost:3000`