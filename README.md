<div align="center">
  <img src="public/logo.png" alt="SportsHub Logo" width="120" height="120" />
  <h1>SportsHub</h1>
  <p>A next-generation, AI-powered sports management and live dashboard application.</p>
</div>

---

## 📖 Overview

Welcome to **SportsHub**, a dynamic and modern web application designed for managing and tracking sports tournaments, festivals, and leagues. 

Whether you are a spectator wanting to track live scores and AI predictions, or an administrator orchestrating matches and managing teams, SportsHub provides a robust, real-time, and beautifully designed solution.

## ✨ Features

### For Regular Users (Spectators & Fans)
* **Live Match Center**: A real-time dashboard displaying Live, Upcoming, and Completed matches across multiple sports (Cricket, Football, Basketball, etc.).
* **AI Match Predictions**: Curious who will win? SportsHub integrates Google's Gemini AI to analyze historical data, current scores, and match context to predict the winner in real-time, complete with a confidence score and detailed reasoning.
* **Interactive Leaderboards**: Track the points table and standings for your favorite sports dynamically as matches are updated.
* **Match Polls**: Vote on who you think will win directly from the live match cards.
* **Premium UI/UX**: Enjoy a stunning, responsive interface with a beautiful glassmorphism design.
* **Seamless Dark & Light Modes**: Fully adaptive theming that works beautifully whether you prefer a stark dark dashboard or a clean light interface.

### For Administrators
* **Comprehensive Admin Dashboard**: A secure, role-based interface to manage the entire tournament.
* **Live Score Management**: Update scores in real-time, change match statuses (Upcoming ➔ Live ➔ Completed), and manage innings/halves.
* **Team & Player Management**: Create teams, assign players, and manage rosters dynamically.
* **Quick Match Creator**: Rapidly schedule new fixtures and assign teams.
* **Admin Invites**: Invite other trusted organizers to become administrators via a secure email invitation system.

---

## 🛠️ Technology Stack

SportsHub is built with modern, enterprise-ready web technologies to ensure scalability, performance, and developer experience.

### Frontend
* **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
* **UI Library**: React 19
* **Styling**: Tailwind CSS v3 with dynamic CSS variables for theming
* **Components**: Shadcn UI & Framer Motion (for fluid animations)

### Backend & Database
* **Database**: Firebase Firestore (NoSQL Real-time database)
* **Authentication**: Firebase Auth (Email/Password & Session Management)

### AI & Machine Learning
* **AI Engine**: Google Generative AI (Gemini Flash)
* **Orchestration**: [Genkit](https://github.com/firebase/genkit) (Handles AI workflows, exponential backoff retries, and rate limiting)

### Developer Tools
* **Testing**: Jest & React Testing Library (for scoring engines and data logic)
* **CI/CD**: GitHub Actions (Automated type-checking, linting, unit testing, and production builds on every push)

---

## 💻 Developer Guide

Want to run the project locally or contribute to the codebase? Follow these instructions.

### Prerequisites
* Node.js 18+ installed
* A Firebase Project with Firestore and Authentication enabled
* A Google Gemini API Key

### Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/shashankbaswa007/SportsHub.git
   cd SportsHub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env.local` file in the root directory and add your Firebase and Gemini credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   # For Genkit AI Predictions
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Testing
SportsHub uses Jest to test complex business logic, such as the specialized scoring engines for Cricket and Football.

To run the test suite:
```bash
npm run test
```

### CI/CD Pipeline
The repository includes a GitHub Action workflow (`.github/workflows/ci.yml`) that triggers automatically on pushes to the `main` branch. The pipeline executes:
1. Type Checking (`tsc --noEmit`)
2. Unit Tests (`npm run test`)
3. Production Build Validation (`npm run build`)

---

## 🎨 Design System

SportsHub utilizes a custom design token system implemented in `src/app/globals.css`. 
* Avoid hardcoding explicit colors like `text-black` or `bg-white`. 
* Use the semantic tokens `text-foreground` and `bg-background` to ensure components adapt flawlessly between Light and Dark modes.
* Translucency is achieved using Tailwind opacity modifiers on semantic tokens (e.g. `bg-foreground/5`).

---

## 🤝 Contributing
Contributions are always welcome! Ensure that any new business logic is covered by Jest tests and that you adhere to the dynamic theming guidelines.
