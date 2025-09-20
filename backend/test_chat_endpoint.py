import requests
import json

def test_chat():
    url = "http://localhost:8000/api/documents/ask"
    headers = {"Content-Type": "application/json"}
    data = {
        "document_id": "e24adb99-35fb-450d-8a35-f213a620d31f",
        "question": "What is the summary of this document?",
        "session_id": "test-session-1"
    }
    response = requests.post(url, headers=headers, data=json.dumps(data))
    print("Status Code:", response.status_code)
    print("Response:", response.json())

if __name__ == "__main__":
    test_chat()
