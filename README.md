# ⚖️ JusticeBot – AI-Powered Legal Assistance Platform

## Overview

JusticeBot is an AI-powered legal assistance platform designed to provide users with quick access to legal information, relevant laws, and legal guidance. The system combines a structured legal knowledge database with AI-generated responses to deliver accurate and user-friendly legal assistance.

The platform uses MongoDB Atlas for storing legal records and chat history, OpenAI API for intelligent responses, and Render for cloud deployment.


## Problem Statement

Legal information is often difficult for the general public to access and understand. Users may struggle to identify relevant laws, legal procedures, and rights without consulting legal professionals.

JusticeBot addresses this challenge by providing:

* Instant legal information retrieval
* AI-assisted legal guidance
* Searchable legal database
* Legal scenario analysis
* User-friendly web interface



## Features

### 🤖 AI Legal Chat Assistant

* Answers legal queries using AI.
* Provides simplified explanations of legal concepts.
* Offers guidance based on user questions.

### 📚 Legal Knowledge Database

* Stores structured legal records.
* Retrieves relevant laws directly from MongoDB.
* Supports IPC and IT Act sections.

### 🔍 Legal Explorer

* Browse and explore legal provisions.
* Search legal records efficiently.

### 🧠 Hybrid Search System

JusticeBot uses a hybrid approach:

1. Search the legal database.
2. If a matching law is found:

   * Return legal information directly.
3. If no relevant record is found:

   * Generate an AI-assisted response.

### 📊 Analytics Dashboard

Displays:

* Total Queries
* Database-Based Responses
* Hybrid Responses
* Recent Chat Activity

### 💬 Chat History Storage

* Stores user queries and responses.
* Maintains conversation records in MongoDB Atlas.

---

## System Architecture

User Query
↓
JusticeBot Frontend
↓
Express.js Backend
↓
MongoDB Legal Database
↓
OpenAI API (Fallback/AI Assistance)
↓
Response to User

---

## Technology Stack

### Frontend

* HTML5
* CSS3
* JavaScript

### Backend

* Node.js
* Express.js

### Database

* MongoDB Atlas
* MongoDB Compass

### AI Integration

* OpenAI API

### Deployment

* Render

---

## Database Collections

### legals

Stores legal provisions.

Example:

```json
{
  "section": "IPC_378",
  "offense": "Theft",
  "description": "Defines theft under the Indian Penal Code.",
  "punishment": "Imprisonment up to 3 years, fine, or both."
}
```

### chats

Stores user interactions.

Example:

```json
{
  "userMessage": "What is IPC 420?",
  "botResponse": "Cheating and dishonestly inducing delivery of property...",
  "timestamp": "2025-01-01T10:00:00Z"
}
```

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd justicebot
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file:

```env
OPENAI_API_KEY=your_openai_api_key
MONGODB_URL=your_mongodb_connection_string
PORT=5000
```

### Run Application

```bash
npm start
```

Application runs on:

```text
http://localhost:5000
```

---

## Future Enhancements

* Mobile-responsive interface
* Multi-language support
* Advanced legal document analysis
* Voice-based legal assistance
* Expanded legal knowledge base
* Case-law recommendation system
* User authentication and profiles

---

## Project Status

✅ Fully Functional

* AI Chat Assistant
* MongoDB Atlas Integration
* Legal Database Search
* Chat History Storage
* Dashboard Analytics
* Cloud Deployment on Render

---

## Authors

Developed as a legal technology project to improve access to legal information through Artificial Intelligence and database-driven legal search.

---

## License

This project is developed for academic and educational purposes.
