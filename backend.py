from fastapi import FastAPI, Request,UploadFile, File,Form
from pydantic import BaseModel
from typing import List
import os
import ast
import torch
import shutil
import fitz  # PyMuPDF for PDFs
import pandas as pd
import xmltodict
import json
import chromadb
import shutil
from sentence_transformers import SentenceTransformer
from transformers import T5Tokenizer, XLMRobertaTokenizer
from model_loader import predict_language_with_probs, generate_sub_requests, predict_sentence, predict_sentence_sentiment,load_travel_question_detector,get_gemeni,get_ollama
from data_loader import load_label_encoders
from tools import extract_locations,process_uploaded_file
from helpers import translate_to_english, predict_category_subcategory, handle_static_response, stream_response, weather_response, hotel_response
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma
import mysql.connector
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()



conn = mysql.connector.connect(
    host="localhost",
    user="root",
    passwd="root",
    database="travel"
)
mycursor =  conn.cursor()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

mycursor.execute("""
    CREATE TABLE IF NOT EXISTS uploaded_files (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        file_type VARCHAR(50) NOT NULL,
        file_size INT NOT NULL,
        upload_time DATETIME DEFAULT CURRENT_TIMESTAMP
    )
""")
conn.commit()


UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)



class PromptRequest(BaseModel):
    prompt: str

static_response_subcategories = ["Restaurant reservation", "Car rental", "Train/bus ticket booking", 
                                 "Event ticket booking", "Hotel cancellation", "Flight cancellation", 
                                 "Restaurant cancellation", "Tour/excursion cancellation", 
                                 "Car rental cancellation", "Train/bus ticket cancellation", 
                                 "Event ticket cancellation", "Change hotel reservation", 
                                 "Modify flight details", "Edit restaurant reservation", 
                                 "Update tour/excursion booking", "Modify car rental booking", 
                                 "Reschedule train/bus tickets", "Change event tickets"]

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

tokenizer = XLMRobertaTokenizer.from_pretrained("xlm-roberta-base")
splitting_tokenizer = T5Tokenizer.from_pretrained("../new_models/saved_splitting_model")
travel_question_detector = load_travel_question_detector()
ollama_responder = get_ollama()
category_encoder, subcategory_encoder, language_encoder = load_label_encoders()

gemeni = get_gemeni()

@app.post("/ask")
async def ask_travel_bot(request: PromptRequest):
    prompt = request.prompt
    predicted_language, probabilities = predict_language_with_probs(prompt, tokenizer, language_encoder, device)
    
    if predicted_language != "en":  # Translate to English if not already in English
        english_prompt = translate_to_english(prompt, gemeni)
    else:
        english_prompt = prompt

    sentiment = predict_sentence_sentiment(english_prompt, tokenizer, device)
    detected_class = travel_question_detector.detect_question(english_prompt)
    extracted_location = " ".join(extract_locations(english_prompt))
    
    if detected_class[0] == "Not Travel":
        if predicted_language == "en":
            reply = {"response": "The question is detected as a non-travel question. Please ask a travel-related question."}
        elif predicted_language == "fr":
            reply = {"response": "La question est détectée comme une question non liée aux voyages. Veuillez poser une question liée aux voyages."}
        else:
            reply = {"response": "تم اكتشاف أن سؤالك ليس متعلقًا بالسفر. يرجى طرح سؤال متعلق بالسفر."}
        return reply
    
    else:
        request_complexity = predict_sentence(tokenizer, english_prompt, device)
        if request_complexity == 1:  # Complex request
            sub_requests = ast.literal_eval(generate_sub_requests(splitting_tokenizer, english_prompt, device))
            responses = []
            for sub_prompt in sub_requests:
                predicted_category, predicted_category_prob, predicted_subcategory, predicted_subcategory_prob = predict_category_subcategory(
                    sub_prompt, tokenizer, category_encoder, subcategory_encoder, device
                )

                if predicted_subcategory in static_response_subcategories:
                    response = handle_static_response(predicted_subcategory, predicted_language)
                elif predicted_subcategory == "Weather conditions":
                    response = weather_response(extracted_location)
                elif predicted_subcategory == "Hotel availability":
                    response = hotel_response(extracted_location)
                else:
                    response = stream_response(ollama_responder, sub_prompt, extracted_location, predicted_language)
                
                responses.append({
                    "subject": detected_class,
                    "category": predicted_category,
                    "category_prob": round(predicted_category_prob * 100, 2),
                    "subcategory": predicted_subcategory,
                    "subcategory_prob": round(predicted_subcategory_prob * 100, 2),
                    "location": extracted_location,
                    "response": response
                })
            return {"responses": responses}
        
        else:  # Simple request
            predicted_category, predicted_category_prob, predicted_subcategory, predicted_subcategory_prob = predict_category_subcategory(
                prompt, tokenizer, category_encoder, subcategory_encoder, device
            )
            if predicted_subcategory in static_response_subcategories:
                response = handle_static_response(predicted_subcategory, predicted_language)
            elif predicted_subcategory == "Weather conditions":
                response = weather_response(extracted_location)
            elif predicted_subcategory == "Hotel availability":
                response = hotel_response(extracted_location)
            else:
                response = stream_response(ollama_responder, prompt, extracted_location, predicted_language)
            
            return {
                "subject": detected_class,
                "category": predicted_category,
                "category_prob": round(predicted_category_prob * 100, 2),
                "subcategory": predicted_subcategory,
                "subcategory_prob": round(predicted_subcategory_prob * 100, 2),
                "location": extracted_location,
                "response": response
            }
class QueryRequest(BaseModel):
    query: str

# Initialize Embedding Model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Initialize ChromaDB
chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection(name="travel_docs")

# Extract text based on file type
def extract_text(file_path, file_type):
    if file_type == "application/pdf":
        text = ""
        with fitz.open(file_path) as doc:
            for page in doc:
                text += page.get_text("text") + "\n"
        return text

    elif file_type == "text/csv":
        df = pd.read_csv(file_path)
        return df.to_string()

    elif file_type == "application/xml" or file_type == "text/xml":
        with open(file_path, "r", encoding="utf-8") as f:
            data = xmltodict.parse(f.read())
        return json.dumps(data, indent=2)

    elif file_type == "application/json":
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return json.dumps(data, indent=2)

    else:
        return None

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    # Save the file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract text
    text = extract_text(file_path, file.content_type)
    if text is None:
        return {"error": "Unsupported file type"}

    try:
        
        embedding = model.encode(text)
        embedding_list = embedding.tolist()  

        sql = "INSERT INTO uploaded_files (filename, file_type, file_size) VALUES (%s, %s, %s)"
        values = (file.filename, file.content_type, os.path.getsize(file_path))
        mycursor.execute(sql, values)
        conn.commit()
        file_id = mycursor.lastrowid

        collection.add(
            ids=[str(file_id)],
            embeddings=[embedding_list],  # Pass as list
            documents=[text],
            metadatas=[{"filename": file.filename, "file_type": file.content_type}]
        )

        return {
            "message": "File uploaded, processed, and indexed successfully!",
            "file_id": file_id
        }
    except Exception as e:
        conn.rollback()
        return {"error": f"Error processing file: {str(e)}"}
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

@app.post("/file_rag")
async def file_rag(request: PromptRequest):
    try:
        embeddings = OpenAIEmbeddings()
        vectorstore = Chroma(
            persist_directory="./travel_docs_db",
            embedding_function=embeddings
        )
        
        docs = vectorstore.similarity_search(request.query, k=3)
        context = "\n".join([doc.page_content for doc in docs])
        
        prompt = f"Context: {context}\nQuestion: {request.prompt}"
        response = stream_response(ollama_responder, prompt, "", "en")
        
        return {
            "response": response,
            "sources": [doc.metadata for doc in docs]
        }
    except Exception as e:
        return {"error": str(e)}
    
@app.post("/signup")
def signup(UID:str = Form(...), fullName:str = Form(...)):
    try:
        sql = "INSERT INTO users (UID, fullName) VALUES (%s, %s)"
        values = (UID, fullName)
        mycursor.execute(sql, values)
        conn.commit()
        return {"message": "User signed up successfully!"}
    except Exception as e:
        conn.rollback()
        return {"error": f"Error signing up user: {str(e)}"}
@app.get("/user")
def user(UID:str):
    try:
        mycursor.execute("SELECT * FROM users WHERE UID=%s", (UID,))
        user = mycursor.fetchone()
        if user:
            return {"user": user}
        else:
            return {"error": "User not found"}
    except Exception as e:
        return {"error": f"Error fetching user: {str(e)}"}