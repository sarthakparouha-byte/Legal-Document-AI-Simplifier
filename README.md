# Legal Document AI Simplifier

> An AI-powered tool to make legal documents accessible to everyone via intelligent analysis, plain-language summaries, and interactive Q&A.

---

## Table of Contents

- [Problem Statement](#problem-statement)  
- [Solution](#solution)  
- [Key Features](#key-features)  
- [Current Prototype](#current-prototype)  
- [Planned Enhancements](#planned-enhancements)  
- [Architecture & Tech Stack](#architecture--tech-stack)  
- [Setup & Installation](#setup--installation)  
- [Usage](#usage)  
- [Contributing](#contributing)  
- [License](#license)  

---

## Problem Statement

Legal documents are pervasive in business, government, contracts, and more — but they are often full of dense legalese, complex wording, and jargon. Most people:

- don’t have legal training  
- struggle to understand their rights / obligations  
- feel frustrated or unsure about what they're signing

Current alternatives are either expensive legal consultations or generic AI tools that don’t understand legal context, leaving many to “sign blindly.”

---

## Solution

We aim to democratize legal understanding by offering:

- **Instant Document Analysis** using Google Gemini 1.5-Flash  
- **Plain-English Summaries** for better understanding  
- **Key Clause Extraction** along with detailed explanations  
- **Risk Assessment** to flag potential issues  
- **Interactive Q&A** for querying specific parts of a document

---

## Key Features

- Support for **PDF, DOC, and TXT** document uploads  
- Multi-step wizard interface with separate tabs: Summary, Key Clauses, Risk Assessment, Q&A  
- Visualization/help with legal terms & explanations  

---

## Current Prototype

- **Document Upload** capability (PDF, DOC, TXT)  
- Integrated with **Google Gemini** for document understanding & generating summaries / clause extraction / risk evaluation  
- Basic user interface to view summaries, key clauses, risk assessment, and ask questions interactively  

---

## Planned Enhancements

- Add **Photo Upload & OCR**: Take images of documents and convert them to text for processing  
- Add **User Authentication**: Secure login, personal document libraries  
- Predefined Q&A templates depending on document type to help users ask smarter questions  

---

## Architecture & Tech Stack

| Layer | Technology / Tools |
|---|---|
| Backend | Python (for AI integration), possibly Flask/FastAPI or Django |
| AI / NLP | Google Gemini 1.5-Flash |
| Frontend | HTML / CSS / JavaScript |
| Deployment | (e.g. Railway, or other cloud provider) |
| Other | File handling for PDFs/DOCs/TXT, OCR libs (for future), risk/legal term dictionaries |

---

## Setup & Installation

> **Prerequisites**  
> Make sure you have:  
> - Python 3.x  
> - Node.js / npm (if frontend has build steps)  
> - Access credentials/tokens for Google Gemini which this project uses  

```bash
# Clone the repo
git clone https://github.com/sarthakparouha-byte/Legal-Document-AI-Simplifier.git
cd Legal-Document-AI-Simplifier

# Backend setup
cd backend
pip install -r requirements.txt

# Frontend setup
cd ../frontend
npm install

# Environment variables
# Create a .env file (or however you manage secrets) with:
#   GEMINI_API_KEY=your_key_here
#   Other config like storage, etc.

# Running development servers
cd backend
# e.g. uvicorn main:app --reload  (or equivalent)
cd ../frontend
npm run dev                                
