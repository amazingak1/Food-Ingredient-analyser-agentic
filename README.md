# _Screenshot of working website_
<img width="2560" height="1440" alt="image" src="https://github.com/user-attachments/assets/f0a721a1-d8c7-4a8d-ad83-dde1469b1ab7" />
<img width="1522" height="1423" alt="image" src="https://github.com/user-attachments/assets/66f43955-82bc-42fc-9222-7b502d3a36f7" />
<hr>
# 🥗 Ingredient Health Analyzer

Welcome to the **Ingredient Health Analyzer** project! 
This application helps users quickly understand what they are eating by analyzing photos of ingredient labels using AI. It identifies healthy nutrients, harmful additives, hidden allergens, and provides an overall health score.

## ✨ Features
- **Instant AI Analysis**: Powered by Google's latest Gemini 2.5 Flash Vision model.
- **Color-Coded Verdicts**: Neatly categorizes ingredients into Good, Unhealthy, Additives/Colors, and Allergens.
- **Premium User Interface**: Built with Next.js and Tailwind CSS, featuring glassmorphism elements, interactive text particle canvas effects, and beautiful iconography.
- **Drag & Drop Upload**: Easy and intuitive image uploading process natively through the browser.

---

## 🏗️ Architecture

The project is split into two main directories:
1. `backend/`: A Python FastAPI server that acts as the bridge to the Google Gemini API.
2. `frontend/`: A modern Next.js React application with Tailwind CSS for rendering the UI.

---

## 🚀 Getting Started

Follow these steps to run the application locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Python](https://www.python.org/) 3.10+
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey)

---

### Step 1: Set Up and Run the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Activate the Python virtual environment:
   - On Windows:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - On Mac/Linux:
     ```bash
     source venv/bin/activate
     ```
3. Install dependencies (if you haven't already):
   ```bash
   pip install fastapi uvicorn python-multipart google-generativeai pydantic python-dotenv Pillow
   ```
4. Create a `.env` file in the `backend/` directory and add your Gemini API Key:
   ```env
   GEMINI_API_KEY="your_api_key_here"
   ```
5. Start the FastAPI server in development mode:
   ```bash
   uvicorn main:app --reload
   ```
*The backend server will run on `http://localhost:8000`. Keep this terminal window open.*

---

### Step 2: Set Up and Run the Frontend

1. Open a **new terminal window** and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the Node modules:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
*The frontend application will be running on `http://localhost:3000`.*

---

## 📱 Usage
- Open your browser and go to [http://localhost:3000](http://localhost:3000). 
- Hover over the "Know what you eat." title to see the interactive text particle canvas effect.
- Drag and drop (or click to upload) an image consisting of a food ingredient label.
- Click **Analyze Ingredients** and wait a few seconds for the AI classification!

---

## 📝 Developer Notes
*(Stored from user requests)*
- **Backend Port & Routing**: Do not navigate to `localhost:8000` directly as it will show a welcome/404 message. It is designed to purely service API requests.
- **Interactive Heading**: The `Know what you eat.` effect on the frontend uses an HTML5 Canvas implementation located at `frontend/src/components/ui/text-particle.tsx`.

## 🛠️ Built With
- [Next.js App Router](https://nextjs.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [21stdev ](https://21st.dev/)
- [FastAPI](https://fastapi.tiangolo.com/)

