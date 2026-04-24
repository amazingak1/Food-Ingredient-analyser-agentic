# 🧬 Project Info — Ingredient Health Analyzer

> A complete breakdown of every technology, library, and tool used to build this project — and how they all work together.

---

## 🏛️ Architecture Overview

This is a **decoupled fullstack application** with two independent services:

```
┌─────────────────────────┐         HTTP (REST API)         ┌──────────────────────────┐
│      Frontend           │ ◄──────────────────────────────► │       Backend            │
│   Next.js + React       │        /api/analyze-ingredients  │   Python + FastAPI       │
│   (Port 3000)           │        /api/history              │   (Port 8000)            │
└─────────────────────────┘                                  └──────────┬───────────────┘
                                                                       │
                                                              ┌────────▼────────┐
                                                              │  Google Gemini   │
                                                              │  2.5 Flash API   │
                                                              │  (Vision Model)  │
                                                              └────────┬────────┘
                                                                       │
                                                              ┌────────▼────────┐
                                                              │    MongoDB       │
                                                              │  (Scan History)  │
                                                              └─────────────────┘
```

---

## ⚙️ Backend — Technologies

| Technology | Version | Purpose |
|---|---|---|
| **Python** | 3.11 | Core runtime language |
| **FastAPI** | latest | High-performance async web framework for building REST APIs |
| **Uvicorn** | latest (standard) | ASGI server that runs the FastAPI application |
| **Google Generative AI SDK** | latest | Official Python SDK to call the Gemini 2.5 Flash vision model |
| **Pydantic** | (bundled with FastAPI) | Request/response data validation and serialization |
| **Pillow (PIL)** | latest | Image processing — converts uploaded images to JPEG for safe Gemini processing |
| **python-dotenv** | latest | Loads environment variables (API keys, DB URIs) from `.env` files |
| **python-multipart** | latest | Enables `multipart/form-data` file uploads in FastAPI |
| **Motor** | latest | Async MongoDB driver for Python, used to persist scan history |

### Backend File Structure

```
backend/
├── main.py              # All API logic — endpoints, Gemini calls, MongoDB integration
├── requirements.txt     # Python dependencies
├── .env                 # Environment secrets (GEMINI_API_KEY, MONGO_URI)
├── Procfile             # Deployment config (Render / Heroku)
└── runtime.txt          # Specifies Python 3.11 for cloud deployment
```

### API Endpoints

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/analyze-ingredients` | Accepts an image file + item name, returns AI-classified ingredient analysis |
| `GET` | `/api/history` | Returns the last 20 scans from MongoDB |
| `GET` | `/health` | Health-check endpoint for monitoring |

---

## 🎨 Frontend — Technologies

| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16.2.1 | React meta-framework with App Router, SSR/SSG, and file-based routing |
| **React** | 19.2.4 | Component-based UI library |
| **TypeScript** | ^5 | Type-safe JavaScript for the entire frontend codebase |
| **Tailwind CSS** | v4 | Utility-first CSS framework for rapid, responsive styling |
| **@tailwindcss/postcss** | v4 | PostCSS plugin to compile Tailwind |
| **Framer Motion** | ^12.38.0 | Declarative animations — page transitions, element entrances, hover effects |
| **Lucide React** | ^1.7.0 | Beautiful, consistent SVG icon library (Salad, Upload, AlertTriangle, etc.) |
| **next-themes** | ^0.4.6 | Dark/light mode toggling with system preference detection |
| **Geist Font** | (via `next/font/google`) | Modern sans-serif + monospace typography from Vercel |
| **ESLint** | ^9 | Code linting with Next.js recommended rules |

### Frontend File Structure

```
frontend/src/
├── app/
│   ├── layout.tsx           # Root layout — fonts, ThemeProvider, global wrappers
│   ├── page.tsx             # Main page — upload, analyze, display results
│   ├── globals.css          # Tailwind imports, CSS variables, shine animation keyframes
│   └── history/
│       └── page.tsx         # Scan history page — fetches & displays past analyses
└── components/ui/
    ├── interactive-text-particle.tsx   # HTML5 Canvas particle text effect ("Know what you eat.")
    ├── rainbow-borders-button.tsx      # Animated rainbow gradient border button (CSS keyframes)
    ├── shine-border.tsx               # Animated shine/glow border effect (radial gradient mask)
    ├── theme-provider.tsx             # next-themes wrapper component
    └── theme-toggle.tsx               # Sun/Moon dark mode toggle button
```

---

## 🧠 AI / Machine Learning

| Technology | Details |
|---|---|
| **Google Gemini 2.5 Flash** | Multimodal vision model — analyzes food label images |
| **Prompt Engineering** | Custom structured prompt that extracts safe, moderate, risky ingredients, additives, allergens, and a health score (0–100) |
| **Output Format** | Model returns structured JSON which is parsed directly into the frontend UI |

### How the AI Analysis Works

1. User uploads a photo of a food ingredient label
2. The image is converted to JPEG via **Pillow** for compatibility
3. The image bytes + a detailed prompt are sent to **Gemini 2.5 Flash**
4. Gemini returns a JSON object categorizing ingredients into:
   - ✅ **Safe** — whole foods, natural spices
   - ⚠️ **Moderate** — salt, refined flour (safe in moderation)
   - 🔴 **Risky** — trans fats, excess sugars, palm oil
   - 💊 **Additives & Colors** — INS/E-numbers with risk levels
   - 🥜 **Allergens** — soy, wheat, nuts, etc.
   - 📊 **Health Score** — 0 to 100 with a written explanation

---

## 🗄️ Database

| Technology | Purpose |
|---|---|
| **MongoDB** | NoSQL document database for storing scan history |
| **Motor** | Async Python driver for MongoDB (non-blocking I/O) |

Each scan document contains:
```json
{
  "item_name": "Oreo Cookies",
  "created_at": "2026-04-24T10:30:00Z",
  "result": {
    "health_score": 25,
    "safe_ingredients": [...],
    "moderate_ingredients": [...],
    "risky_ingredients": [...],
    "food_colorings_additives": [...],
    "allergens": [...],
    "explanation": "..."
  }
}
```

---

## ✨ UI / Design Highlights

| Feature | Implementation |
|---|---|
| **Glassmorphism Header** | `backdrop-blur-md` + semi-transparent background |
| **Interactive Particle Text** | Custom HTML5 Canvas — text shatters into particles on hover, physics-based restoration |
| **Rainbow Border Button** | CSS `@keyframes` animation cycling through gradient colors |
| **Shine Border Effect** | Animated radial gradient with CSS mask compositing |
| **Dark / Light Mode** | `next-themes` provider with Tailwind `dark:` variants |
| **Smooth Page Animations** | Framer Motion `<motion.div>` with fade, scale, and slide transitions |
| **Live Backend Status** | Pinging `/health` endpoint with animated dot indicator (green/red/amber) |
| **Color-Coded Results** | Emerald (safe), Amber (moderate), Rose (risky), Orange (allergens) |
| **Responsive Design** | Mobile-first Tailwind utilities, flexible grid layouts |

---

## 🚀 Deployment

| Aspect | Details |
|---|---|
| **Backend hosting** | Configured for **Render**  via `Procfile` and `runtime.txt` |
| **Frontend hosting** | Deployable to **Vercel** (native Next.js support) |
| **Environment variables** | `GEMINI_API_KEY` and `MONGO_URI` stored in `.env` |
| **CORS** | Backend allows all origins (`*`) for cross-origin frontend requests |

---

## 🔧 Dev Tools & Configuration

| Tool | Purpose |
|---|---|
| **PostCSS** | CSS transformation pipeline (used by Tailwind v4) |
| **ESLint** | JavaScript/TypeScript linting with Next.js + TypeScript rules |
| **TypeScript** | Static type checking across the frontend |
| **Git** | Version control with a comprehensive `.gitignore` |

---

## 📦 Full Dependency List

### Backend (`requirements.txt`)
```
fastapi
uvicorn[standard]
python-dotenv
pillow
google-generativeai
python-multipart
motor
```

### Frontend (`package.json`)
```
# Dependencies
next@16.2.1
react@19.2.4
react-dom@19.2.4
framer-motion@^12.38.0
lucide-react@^1.7.0
next-themes@^0.4.6

# Dev Dependencies
tailwindcss@^4
@tailwindcss/postcss@^4
typescript@^5
eslint@^9
eslint-config-next@16.2.1
@types/node@^20
@types/react@^19
@types/react-dom@^19
```

---

## 🔄 Workflow — How It All Comes Together

```
    ┌──────────┐     ┌──────────────┐     ┌───────────┐     ┌──────────┐
    │  User    │────►│  Next.js     │────►│  FastAPI   │────►│  Gemini  │
    │  Browser │     │  Frontend    │     │  Backend   │     │  AI API  │
    └──────────┘     └──────────────┘     └─────┬─────┘     └──────────┘
                                                │
                           ┌────────────────────▼──────────────────────┐
                           │               MongoDB                     │
                           │   (stores scan results for history page)  │
                           └───────────────────────────────────────────┘
```

1. **User** opens the app at `localhost:3000`
2. **Next.js** renders the premium UI with particle text effects and glassmorphism
3. User enters an item name and uploads an ingredient label image
4. Frontend sends a `POST` request with the image to **FastAPI** at `/api/analyze-ingredients`
5. FastAPI processes the image with **Pillow** (converts to JPEG)
6. The image + a structured prompt are sent to **Google Gemini 2.5 Flash**
7. Gemini returns a categorized JSON response
8. FastAPI saves the result to **MongoDB** via **Motor** and returns it to the frontend
9. **Framer Motion** animates the results into view — color-coded ingredient cards with health score
10. User can visit `/history` to browse all past scans fetched from MongoDB

---

*Built with ❤️ using modern fullstack technologies.*
