# 🌍 Tranger AI

> **Collaborative, AI-Powered Travel Planning Application.**

Tranger AI is a modern travel planner that combines the power of Generative AI with an intuitive drag-and-drop interface. Plan trips solo or collaborate in real-time with friends, visualize your itinerary, and get smart recommendations for your next adventure.

![App Screenshot](https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80)

## ✨ Key Features

- **🤖 AI Trip Generation**: Powered by **Google Gemini 2.5**, simply enter a destination and duration to get a fully curated itinerary in seconds.
- **🖱️ Drag & Drop Interface**: Effortlessly move activities between days or reorder your schedule using a smooth, physics-based dnd interaction.
- **👥 Real-Time Collaboration**: Invite friends via email or link. See who is online and chat in real-time contextually within the trip.
- **📱 PWA & Mobile Ready**: Installable on iOS and Android. Responsive design ensures you can plan on the go.
- **🌍 Multi-Language Support**: Built-in support for English (EN), Traditional Chinese (繁體), and Japanese (JP).
- **🗺️ Smart Location Search**: Integrated mock Google Places API for finding spots, checking ratings, and opening directions directly in Google Maps.

## 🛠️ Tech Stack

This project leverages a cutting-edge **Next.js 15** architecture:

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Drag & Drop**: [@dnd-kit](https://dndkit.com/)
- **AI Model**: [Google Gemini API (@google/genai)](https://ai.google.dev/)
- **Testing**: [Vitest](https://vitest.dev/) (Unit) & [Playwright](https://playwright.dev/) (E2E)
- **Database (Mocked/Ready)**: Prisma ORM schema ready for PostgreSQL.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed.
- A Google Cloud Project with the **Gemini API** enabled (Get an API Key [here](https://aistudiocdn.com.google.com/)).

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/Tranger-ai.git
   cd Tranger-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env.local` file in the root directory:
   ```env
   # Required for AI Features
   API_KEY=your_google_gemini_api_key
   
   # Optional: Database URL if running with a real DB
   # DATABASE_URL="postgresql://..."
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🐳 Running with Docker

You can spin up the entire environment including the E2E test runner using Docker Compose:

```bash
docker-compose up --build
```

- **App**: http://localhost:3000
- **Playwright Report**: Generated in the `playwright-report` folder after tests run.

## 📱 How to Use

1. **Create a Trip**: Click "New Trip". Enter "Tokyo", select dates, and toggle "Use AI Assistant".
2. **Edit Itinerary**: Drag cards to reorder. Click a card to edit time, cost, or notes.
3. **Invite Friends**: Click "Invite" in the header to copy a shareable link.
4. **Chat**: Open the chat sidebar to leave notes or discuss plans with collaborators.

## 📄 License

MIT License. Free to use for personal and commercial projects.
