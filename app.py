from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from retriever import retrieve


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


class Query(BaseModel):
    question: str


@app.get("/")
def home():
    return {
        "message": "Offline Chatbot Backend Running with Qwen2.5"
    }


@app.post("/ask")
def ask(query: Query):
    user_question = query.question.strip()

    if not user_question:
        return {
            "answer": "Please enter a question."
        }

    answer = retrieve(user_question)

    return {
        "answer": answer
    }