import React, { useState } from "react";

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [response, setResponse] = useState("");

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first!");
      return;
    }

    const apiKey = process.env.REACT_APP_GOOGLE_GEMINI_KEY;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("https://gemini.googleapis.com/v1/media:upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
        },
        body: formData,
      });

      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error("Upload failed:", err);
      setResponse("Upload failed, check console for details.");
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      <pre>{response}</pre>
    </div>
  );
};

export default FileUpload;
