import os
import io
import json
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import List
from PIL import Image

load_dotenv()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

app = FastAPI(title="Ingredient Health Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalysisResponse(BaseModel):
    health_score: int
    healthy_ingredients: List[str]
    unhealthy_ingredients: List[str]
    food_colorings_additives: List[str]
    allergens: List[str]
    explanation: str

def analyze_image_with_gemini(image_data: bytes) -> dict:
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = """
        Analyze this image of a food ingredient label. 
        Extract the ingredients and categorize them into:
        1. "healthy_ingredients": Generally healthy or harmless ingredients.
        2. "unhealthy_ingredients": Unhealthy ingredients like excess sugar, bad fats, etc.
        3. "food_colorings_additives": Artificial colorings (like Red 40, E-numbers), preservatives, or weird chemicals.
        4. "allergens": Common allergens found or mentioned.
        5. "health_score": A score from 0 to 100 based on how healthy the product is.
        6. "explanation": A short 2-3 sentence summary of why it got this score.
        
        Return ONLY a JSON response without any markdown code blocks matching exactly this structure below:
        {
          "health_score": 50,
          "healthy_ingredients": ["water", "salt"],
          "unhealthy_ingredients": ["sugar", "high fructose corn syrup"],
          "food_colorings_additives": ["E129", "Red 40", "TBHQ"],
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
async def analyze_ingredients(file: UploadFile = File(...)):
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
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/")
def read_root():
    return {"message": "Welcome to the Ingredient Health Analyzer API. Please use the frontend at http://localhost:3000 to interact with the app."}
