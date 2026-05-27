# retriever.py

import os
import sys
import re
import random
from typing import Any, cast

import faiss
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer
from llama_cpp import Llama


def resource_path(relative_path):
    if hasattr(sys, "_MEIPASS"):
        return os.path.join(getattr(sys, "_MEIPASS"), relative_path)

    return os.path.join(os.path.dirname(os.path.abspath(__file__)), relative_path)


DATASET_PATH = resource_path("placement_data.csv")
EMBEDDINGS_PATH = resource_path("embeddings.npy")
FAISS_PATH = resource_path("faiss_index.index")

EMBEDDING_MODEL_PATH = resource_path(
    os.path.join("models", "embedding_model")
)

MODEL_PATH = resource_path(
    os.path.join("models", "qwen2.5-1.5b-instruct-q4_k_m.gguf")
)


data = pd.read_csv(DATASET_PATH)

questions = data["question"].fillna("").astype(str).tolist()
answers = data["answer"].fillna("").astype(str).tolist()

if "category" in data.columns:
    categories = data["category"].fillna("").astype(str).tolist()
else:
    categories = ["general"] * len(questions)


clean_questions = []
clean_answers = []
clean_categories = []
seen = set()

for q, a, c in zip(questions, answers, categories):
    q = q.strip()
    a = a.strip()
    c = c.strip()

    if len(q) < 3 or len(a) < 1:
        continue

    key = q.lower()

    if key not in seen:
        seen.add(key)
        clean_questions.append(q)
        clean_answers.append(a)
        clean_categories.append(c)

questions = clean_questions
answers = clean_answers
categories = clean_categories


if not os.path.exists(EMBEDDING_MODEL_PATH):
    raise FileNotFoundError(
        f"Embedding model folder not found at: {EMBEDDING_MODEL_PATH}"
    )

print("Loading embedding model...")
embedding_model = SentenceTransformer(
    EMBEDDING_MODEL_PATH,
    local_files_only=True
)


if os.path.exists(EMBEDDINGS_PATH) and os.path.exists(FAISS_PATH):
    embeddings = np.load(EMBEDDINGS_PATH)
    index = faiss.read_index(FAISS_PATH)
    print("FAISS index loaded.")
else:
    print("Creating embeddings...")

    embeddings = embedding_model.encode(
        questions,
        show_progress_bar=True
    )

    embeddings = np.array(embeddings, dtype=np.float32)

    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(embeddings)

    np.save(EMBEDDINGS_PATH, embeddings)
    faiss.write_index(index, FAISS_PATH)

    print("FAISS index created.")


if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model not found at: {MODEL_PATH}")

print("Loading Qwen2.5 model...")

llm = Llama(
    model_path=MODEL_PATH,
    n_ctx=2048,
    n_threads=4,
    verbose=False
)

print("Qwen2.5 model loaded.")


def clean_answer(text, max_sentences=4):
    text = str(text).strip()
    text = re.sub(r"\s+", " ", text)

    sentences = re.split(r"(?<=[.!?])\s+", text)
    return " ".join(sentences[:max_sentences]).strip()


def ask_qwen(query):
    prompt = f"""
<|im_start|>system
You are a friendly, helpful offline AI assistant.
Reply in a warm, natural, and human-like way.
Be polite, simple, and conversational.
Do not sound robotic.
Keep answers short and useful.
Maximum 4 sentences.
<|im_end|>
<|im_start|>user
{query}
<|im_end|>
<|im_start|>assistant
"""

    try:
        output = cast(
            Any,
            llm.create_completion(
                prompt=prompt,
                max_tokens=180,
                temperature=0.35,
                top_p=0.9,
                stop=["<|im_end|>", "<|im_start|>"],
                stream=False
            )
        )

        answer = str(output["choices"][0]["text"]).strip()

        if len(answer) < 2:
            return "I’m sorry, I couldn’t generate a proper answer. Please try again."

        return clean_answer(answer, 4)

    except Exception as e:
        print("Qwen Error:", e)
        return "Sorry, the offline AI model is not responding right now."


def handle_question_requests(query_lower):
    keywords = ["question", "questions", "top", "interview"]

    if not any(k in query_lower for k in keywords):
        return None

    limit = 5
    nums = re.findall(r"\d+", query_lower)

    if nums:
        limit = min(int(nums[0]), 20)

    selected_category = None

    category_keywords = {
        "hr": "hr",
        "dsa": "dsa",
        "coding": "dsa",
        "dbms": "dbms",
        "os": "os",
        "cn": "cn",
        "network": "cn",
        "java": "java",
        "python": "python",
        "oops": "oops",
        "aptitude": "aptitude"
    }

    for key, value in category_keywords.items():
        if key in query_lower:
            selected_category = value
            break

    results = []
    used = set()

    for q, c in zip(questions, categories):
        if selected_category and selected_category not in c.lower():
            continue

        if q.lower() in used:
            continue

        used.add(q.lower())
        results.append(q)

    random.shuffle(results)
    results = results[:limit]

    if not results:
        return None

    return "\n\n".join(
        f"{i}. {q}" for i, q in enumerate(results, start=1)
    )


def search_dataset(query):
    query_embedding = embedding_model.encode([query])
    query_embedding = np.array(query_embedding, dtype=np.float32)

    distances, indices = index.search(query_embedding, 1)

    best_distance = float(distances[0][0])
    best_index = int(indices[0][0])

    matched_question = questions[best_index]
    matched_answer = answers[best_index]

    print("\n====================")
    print("USER:", query)
    print("MATCH:", matched_question)
    print("DISTANCE:", best_distance)
    print("====================\n")

    query_words = set(re.findall(r"\w+", query.lower()))
    matched_words = set(re.findall(r"\w+", matched_question.lower()))
    common_words = query_words.intersection(matched_words)

    if best_distance < 0.75 and len(common_words) >= 1:
        return clean_answer(matched_answer, 4)

    return None


def retrieve(query):
    query = query.strip()

    if not query:
        return "Please enter a question."

    query_lower = query.lower()

    question_result = handle_question_requests(query_lower)
    if question_result:
        return question_result

    dataset_answer = search_dataset(query)
    if dataset_answer:
        return dataset_answer

    return ask_qwen(query)