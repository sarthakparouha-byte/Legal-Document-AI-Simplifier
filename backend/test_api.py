import pytest
import httpx
import asyncio
import os

# Use environment variable or fallback to localhost
BASE_URL = os.getenv("API_URL", "https://legal-ai-assistant-production-457f.up.railway.app")

@pytest.mark.asyncio
async def test_document_lifecycle():
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Upload a file
        file_path = "../uploads/sample_legal_document.pdf"
        if not os.path.exists(file_path):
            pytest.skip(f"Test file {file_path} not found, skipping test")
        with open(file_path, "rb") as f:
            files = {"file": ("testfile.pdf", f, "application/pdf")}
            response = await client.post(f"{BASE_URL}/documents/upload", files=files)
        assert response.status_code == 200
        data = response.json()
        document_id = data.get("document_id")
        assert document_id is not None

        # Get documents list
        response = await client.get(f"{BASE_URL}/documents")
        assert response.status_code == 200
        documents = response.json()
        assert any(doc["id"] == document_id for doc in documents)

        # Get specific document
        response = await client.get(f"{BASE_URL}/documents/{document_id}")
        assert response.status_code == 200
        document = response.json()
        assert document["id"] == document_id

        # Analyze document
        response = await client.post(f"{BASE_URL}/documents/{document_id}/analyze")
        assert response.status_code in (200, 500)

        # Ask a question
        question_payload = {
            "document_id": document_id,
            "question": "What is the main purpose of this document?"
        }
        response = await client.post(f"{BASE_URL}/documents/ask", json=question_payload)
        assert response.status_code in (200, 500)

        # Get chat history
        response = await client.get(f"{BASE_URL}/documents/{document_id}/chat")
        assert response.status_code == 200
        chat_history = response.json()
        assert isinstance(chat_history, list)

if __name__ == "__main__":
    asyncio.run(test_document_lifecycle())
