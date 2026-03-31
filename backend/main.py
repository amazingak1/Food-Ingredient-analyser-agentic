import os
print("--- [STARTING FASTAPI BACKEND] ---")
import io
import json
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import List, Optional
from PIL import Image
from datetime import datetime, timezone
import motor.motor_asyncio

load_dotenv()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

app = FastAPI(title="Ingredient Health Analyzer API")

# Setup MongoDB
MONGO_URI = os.getenv("MONGO_URI")
if MONGO_URI:
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
    db = client.food_analyzer
    scans_collection = db.scans
else:
    print("Warning: MONGO_URI not found. MongoDB integration disabled.")
    scans_collection = None
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalysisResponse(BaseModel):
    health_score: int
    safe_ingredients: List[str]
    moderate_ingredients: List[str]
    risky_ingredients: List[str]
    food_colorings_additives: List[str]
    allergens: List[str]
    explanation: str

def analyze_image_with_gemini(image_data: bytes) -> dict:
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = """
        Analyze this image of a food ingredient label. 
        Extract the ingredients and categorize them into:
        1. "safe_ingredients": Generally safe, unprocessed or minimally processed ingredients (e.g., whole foods, natural spices).
        2. "moderate_ingredients": Moderately processed ingredients, or essentials like salt and wheat flour that are safe in moderation but can be harmful in high quantities (e.g. Iodised salt, Refined wheat flour).
        3. "risky_ingredients": Highly processed ingredients, trans fats, excess added sugars, or harmful substances (e.g. Palm oil).
        4. "food_colorings_additives": Additives, preservatives, colorings, INS/E-number codes.
        5. "allergens": Common allergens found or mentioned.
        6. "health_score": A score from 0 to 100 based on how healthy the product is.
        7. "explanation": A short 2-3 sentence summary of why it got this score.
        
        CRITICAL INSTRUCTION 1: Do NOT classify common ingredients (like salt, wheat flour, oil) as "unhealthy" by default. Use "moderate_ingredients" instead based on processing level and quantity assumptions. Avoid absolute labels like "bad" or "unhealthy".
        
        CRITICAL INSTRUCTION 2: For "food_colorings_additives", keep explanations very concise (max 1-2 lines per item). Format it exactly like this:
        [Code or Name] ([Common Name]) → [Risk Level]
        [6-12 word explanation of function and key health concern]

        Example:
        INS 508 (Potassium chloride) → Low risk
        Salt substitute; excess may cause discomfort.

        Return ONLY a JSON response without any markdown code blocks matching exactly this structure below:
        {
          "health_score": 50,
          "safe_ingredients": ["water"],
          "moderate_ingredients": ["Iodised salt", "Refined wheat flour"],
          "risky_ingredients": ["high fructose corn syrup", "palm oil"],
          "food_colorings_additives": [
            "INS 508 (Potassium chloride) → Low risk\\nSalt substitute; excess may cause discomfort."
          ],
          "allergens": ["soy", "wheat"],
          "explanation": "..."
        }
        """
        image_part = {"mime_type": "image/jpeg", "data": image_data}
        response = model.generate_content([prompt, image_part])
        response_text = response.text.strip()
        
        # Clean up possible markdown wrappers
        if response_text.startswith("```json"):
            response_text = response_text[7:-3].strip()
        elif response_text.startswith("```"):
            response_text = response_text[3:-3].strip()
            
        return json.loads(response_text)
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        raise ValueError(f"Failed to analyze image: {str(e)}")

@app.post("/api/analyze-ingredients", response_model=AnalysisResponse)
async def analyze_ingredients(file: UploadFile = File(...), item_name: Optional[str] = Form("Unknown Item")):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
        
    image_data = await file.read()
    
    # Try converting to JPEG for safer processing
    try:
        img = Image.open(io.BytesIO(image_data))
        if img.mode != 'RGB':
            img = img.convert('RGB')
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='JPEG')
        clean_img_data = img_byte_arr.getvalue()
    except Exception as e:
        clean_img_data = image_data # fallback
        
    try:
        result = analyze_image_with_gemini(clean_img_data)
        
        # Save to MongoDB
        if scans_collection is not None:
            scan_doc = {
                "item_name": item_name,
                "created_at": datetime.now(timezone.utc),
                "result": result
            }
            await scans_collection.insert_one(scan_doc)
            
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history")
async def get_history(limit: int = 20):
    if scans_collection is None:
        raise HTTPException(status_code=503, detail="MongoDB not configured")
    
    cursor = scans_collection.find().sort("created_at", -1).limit(limit)
    documents = await cursor.to_list(length=limit)
    
    # Clean up fields for JSON serialization
    for doc in documents:
        doc["_id"] = str(doc["_id"])
        if "created_at" in doc:
            doc["created_at"] = doc["created_at"].isoformat()
            
    return {"history": documents}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/")
def read_root():
    return {"message": "Welcome to the Ingredient Health Analyzer API. Please use the frontend at http://localhost:3000 to interact with the app."}
