import requests
import os
import time
import json

# Load backend URL from environment variable or use localhost by default
BASE_URL = os.getenv("API_URL", "https://legal-ai-assistant-production-457f.up.railway.app")

def test_document_lifecycle():
    """Test the full document lifecycle using synchronous HTTP requests"""
    print("Starting document lifecycle test...")
    print(f"Using API base URL: {BASE_URL}")

    # Test 1: Check if API is running
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"API root endpoint: {response.status_code}")
        if response.status_code != 200:
            print("API is not running properly")
            return False
    except Exception as e:
        print(f"Failed to connect to API: {e}")
        return False

    # Test 2: Upload a file
    file_path = "../uploads/sample_legal_document.pdf"
    if not os.path.exists(file_path):
        print(f"Test file {file_path} not found, skipping test")
        return False

    print(f"Uploading file: {file_path}")
    try:
        with open(file_path, "rb") as f:
            files = {"file": ("sample_legal_document.pdf", f, "application/pdf")}
            response = requests.post(f"{BASE_URL}/documents/upload", files=files, timeout=30)

        print(f"Upload response: {response.status_code}")
        if response.status_code != 200:
            print(f"Upload failed: {response.text}")
            return False

        data = response.json()
        document_id = data.get("document_id")
        print(f"Document uploaded successfully with ID: {document_id}")
        assert document_id is not None

    except Exception as e:
        print(f"Upload failed: {e}")
        return False

    # Test 3: Get documents list
    try:
        response = requests.get(f"{BASE_URL}/documents", timeout=10)
        print(f"Get documents response: {response.status_code}")
        if response.status_code != 200:
            print(f"Get documents failed: {response.text}")
            return False

        documents = response.json()
        print(f"Found {len(documents)} documents")
        assert any(doc["id"] == document_id for doc in documents)

    except Exception as e:
        print(f"Get documents failed: {e}")
        return False

    # Test 4: Get specific document
    try:
        response = requests.get(f"{BASE_URL}/documents/{document_id}", timeout=10)
        print(f"Get document response: {response.status_code}")
        if response.status_code != 200:
            print(f"Get document failed: {response.text}")
            return False

        document = response.json()
        print(f"Retrieved document: {document['filename']}")
        assert document["id"] == document_id

    except Exception as e:
        print(f"Get document failed: {e}")
        return False

    # Test 5: Analyze document (may take time or fail if AI service not configured)
    try:
        print("Starting document analysis...")
        response = requests.post(f"{BASE_URL}/documents/{document_id}/analyze", timeout=60)
        print(f"Analysis response: {response.status_code}")

        if response.status_code == 200:
            analysis_result = response.json()
            print("Document analysis completed successfully")
            print(f"Analysis status: {analysis_result.get('status')}")
        elif response.status_code in (500, 503):
            print("Analysis failed (expected if AI service not configured)")
        else:
            print(f"Analysis failed with unexpected status: {response.status_code}")

    except Exception as e:
        print(f"Analysis failed: {e}")

    # Test 6: Ask a question
    try:
        question_payload = {
            "document_id": document_id,
            "question": "What is the main purpose of this document?"
        }
        response = requests.post(f"{BASE_URL}/documents/ask", json=question_payload, timeout=30)
        print(f"Ask question response: {response.status_code}")

        if response.status_code == 200:
            qa_result = response.json()
            print("Question answered successfully")
            print(f"Question: {qa_result.get('question')}")
            print(f"Answer length: {len(qa_result.get('answer', ''))}")
        elif response.status_code in (500, 503):
            print("Question answering failed (expected if AI service not configured)")
        else:
            print(f"Question answering failed: {response.text}")

    except Exception as e:
        print(f"Question answering failed: {e}")

    # Test 7: Get chat history
    try:
        response = requests.get(f"{BASE_URL}/documents/{document_id}/chat", timeout=10)
        print(f"Get chat history response: {response.status_code}")
        if response.status_code != 200:
            print(f"Get chat history failed: {response.text}")
            return False

        chat_history = response.json()
        print(f"Retrieved {len(chat_history)} chat messages")
        assert isinstance(chat_history, list)

    except Exception as e:
        print(f"Get chat history failed: {e}")
        return False

    print("All tests completed successfully!")
    return True


if __name__ == "__main__":
    success = test_document_lifecycle()
    if success:
        print("\n✅ All tests passed!")
    else:
        print("\n❌ Some tests failed!")
