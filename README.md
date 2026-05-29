# Offline Chat Bot

An AI-powered offline desktop chatbot for placement preparation, technical interviews, HR interviews, DSA learning, and resume assistance.

## Download

Latest Release:

https://github.com/manu1275-m/Offline_ChatBot/releases/latest

## Features

- Offline AI Chatbot
- Qwen2.5 Local Language Model
- FAISS Vector Retrieval
- FastAPI Backend
- Electron Desktop Application
- Multiple Chat Support
- Local Chat Storage

Offline Chat Bot is a desktop AI assistant built using Next.js, Electron, FastAPI, FAISS, Sentence Transformers, and a local GGUF language model.

It works fully offline after installation and is designed for placement preparation, interview practice, DSA help, resume guidance, and general conversations.

## Features

- Fully offline AI chatbot
- Desktop app using Electron
- FastAPI backend
- Local Qwen2.5 GGUF model
- FAISS-based retrieval system
- Sentence Transformer embedding model
- Multiple chat history support
- Pin and delete chats
- Clean modern UI
- No internet required after setup

## Tech Stack

### Frontend
- Next.js
- React
- Electron
- Framer Motion
- React Icons
- React Hot Toast

### Backend
- Python
- FastAPI
- Uvicorn
- FAISS
- Sentence Transformers
- llama-cpp-python

### Model
- Qwen2.5 1.5B Instruct GGUF Quantized Model
- all-MiniLM-L6-v2 Embedding Model

## Project Structure

```text
offline_chatbot/
│
├── frontend/
│   ├── src/app/
│   ├── electron/
│   ├── public/
│   ├── package.json
│   └── next.config.mjs
│
├── models/
│   ├── embedding_model/
│   └── qwen2.5-1.5b-instruct-q4_k_m.gguf
│
├── app.py
├── retriever.py
├── placement_data.csv
├── embeddings.npy
├── faiss_index.index
├── requirements.txt
└── README.md
