import requests
import mimetypes

url = "http://localhost:8000/api/documents/upload"
file_path = "uploads/47ef2187-1f7e-4c91-9950-a6538b04db91.pdf"

mime_type, _ = mimetypes.guess_type(file_path)

with open(file_path, "rb") as f:
    files = {"file": (file_path, f, mime_type)}
    response = requests.post(url, files=files)

print("Status Code:", response.status_code)
print("Response JSON:", response.json())
