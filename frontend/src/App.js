import React, { useState, useEffect } from "react";
import "./App.css";
import "./enhanced-styles.css";
import "./improved-styles.css";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { Switch } from "./components/ui/switch";
import { Progress } from "./components/ui/progress";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Toast, ToastProvider, ToastViewport } from "./components/ui/toast";
import { useToast } from "./hooks/use-toast";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Document Upload Component
const DocumentUpload = ({ onUploadSuccess, onProgress, onToast }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };
  
  const handleFile = async (file) => {
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API}/documents/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
          onProgress?.(percentCompleted);
        },
      });

      setUploadProgress(100);
      onToast?.({
        title: "Upload Successful",
        description: `${file.name} has been uploaded successfully!`,
        variant: "success"
      });
      onUploadSuccess(response.data);
    } catch (error) {
      console.error('Upload failed:', error);
      onToast?.({
        title: "Upload Failed",
        description: "Please try again or check your file format.",
        variant: "destructive"
      });
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };
  
  return (
    <div className="upload-section">
      <div
        className={`upload-area ${dragActive ? 'drag-active' : ''} ${isUploading ? 'uploading' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className="upload-progress">
            <div className="spinner"></div>
            <p>Uploading document...</p>
            <div className="progress-container">
              <Progress value={uploadProgress} className="upload-progress-bar" />
              <span className="progress-text">{uploadProgress}%</span>
            </div>
          </div>
        ) : (
          <>
            <div className="upload-icon">📄</div>
            <h3>Upload Legal Document</h3>
            <p>Drag and drop your document here, or click to browse</p>
            <p className="file-types">Supports PDF, Word, and Text files</p>
            <input
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.txt"
              className="file-input"
            />
          </>
        )}
      </div>
    </div>
  );
};

// Document Analysis Component
const DocumentAnalysis = ({ document, onBack }) => {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isAsking, setIsAsking] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  
  useEffect(() => {
    if (document.analysis_status === 'completed' && document.summary) {
      setAnalysis({
        summary: document.summary,
        key_clauses: document.key_clauses || [],
        risk_assessment: document.risk_assessment || ''
      });
    } else if (document.analysis_status === 'pending') {
      analyzeDocument();
    }
    
    loadChatHistory();
  }, [document]);
  
  const analyzeDocument = async () => {
    setIsAnalyzing(true);
    try {
      const response = await axios.post(`${API}/documents/${document.id}/analyze`);
      setAnalysis(response.data);
      setActiveTab('summary');
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const loadChatHistory = async () => {
    try {
      const response = await axios.get(`${API}/documents/${document.id}/chat`);
      setChatHistory(response.data);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };
  
  const askQuestion = async () => {
    if (!question.trim()) return;
    
    setIsAsking(true);
    try {
      const response = await axios.post(`${API}/documents/ask`, {
        document_id: document.id,
        question: question
      });
      
      setChatHistory(prev => [...prev, {
        question: question,
        answer: response.data.answer,
        timestamp: new Date().toISOString()
      }]);
      
      setQuestion('');
    } catch (error) {
      console.error('Question failed:', error);
      alert('Failed to ask question. Please try again.');
    } finally {
      setIsAsking(false);
    }
  };

  

  
  return (
    <div className="analysis-container">
      <div className="document-header">
        <button onClick={onBack} className="back-btn">← Back to Documents</button>
        <div className="document-info">
          <h2>{document.filename}</h2>
          <p className="upload-date">Uploaded: {new Date(document.upload_date).toLocaleDateString()}</p>
        </div>
      </div>
      
      <div className="analysis-tabs">
        <button 
          className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </button>
        <button 
          className={`tab ${activeTab === 'clauses' ? 'active' : ''}`}
          onClick={() => setActiveTab('clauses')}
        >
          Key Clauses
        </button>
        <button 
          className={`tab ${activeTab === 'risks' ? 'active' : ''}`}
          onClick={() => setActiveTab('risks')}
        >
          Risk Assessment
        </button>
        <button 
          className={`tab ${activeTab === 'qa' ? 'active' : ''}`}
          onClick={() => setActiveTab('qa')}
        >
          Ask Questions
        </button>
      </div>
      
      <div className="tab-content">
        {isAnalyzing ? (
          <div className="analyzing">
            <div className="spinner"></div>
            <h3>Analyzing document...</h3>
            <p>Our AI is reading through your document and preparing a comprehensive analysis.</p>
          </div>
        ) : analysis ? (
          <>
            {activeTab === 'summary' && (
              <div className="summary-section">
                <h3>Document Summary</h3>
                <div className="summary-content">
                  <ReactMarkdown>{analysis.summary}</ReactMarkdown>
                </div>
              </div>
            )}
            
            {activeTab === 'clauses' && (
              <div className="clauses-section">
                <h3>Key Clauses</h3>
                {analysis.key_clauses.length > 0 ? (
                  <div className="clauses-list">
                    {analysis.key_clauses.map((clause, index) => (
                      <div key={index} className="clause-item">
                        <h4>{clause.clause}</h4>
                        <div style={{whiteSpace: 'pre-line'}}>
                          <ReactMarkdown>{clause.explanation}</ReactMarkdown>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="clause-extract" style={{whiteSpace: 'pre-line'}}>
                    {analysis.summary.includes('KEY CLAUSES') ?
                      analysis.summary.split('KEY CLAUSES')[1].split('RISK ASSESSMENT')[0] ||
                      analysis.summary.split('KEY CLAUSES')[1] : 'Key clauses information not available'}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'risks' && (
              <div className="risks-section">
                <h3>Risk Assessment</h3>
                <div className="risk-content">
                  {analysis.risk_assessment ? 
                    <ReactMarkdown>{analysis.risk_assessment}</ReactMarkdown> :
                    <p>No specific risks identified in this document.</p>
                  }
                </div>
              </div>
            )}
            
            {activeTab === 'qa' && (
              <div className="qa-section">
                <h3>Ask Questions</h3>
                
                <div className="question-input">
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask any question about this document..."
                    rows="3"
                  />
                  <button 
                    onClick={askQuestion} 
                    disabled={isAsking || !question.trim()}
                    className="ask-btn"
                  >
                    {isAsking ? 'Asking...' : 'Ask Question'}
                  </button>
                </div>
                
                <div className="chat-history">
                  {chatHistory.map((chat, index) => (
                    <div key={index} className="chat-item">
                      <div className="question">
                        <strong>Q:</strong> {chat.question}
                      </div>
                      <div className="answer">
                        <strong>A:</strong> <ReactMarkdown>{chat.answer}</ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="no-analysis">
            <p>No analysis available. Please try analyzing the document again.</p>
            <button onClick={analyzeDocument} className="analyze-btn">Analyze Document</button>
          </div>
        )}
      </div>
    </div>
  );
};

// Documents Dashboard Component
const DocumentsDashboard = ({ documents, onSelectDocument, onUploadNew, onDeleteDocument, isDarkMode }) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectMode, setSelectMode] = React.useState(false);
  const [selectedDocuments, setSelectedDocuments] = React.useState([]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'green';
      case 'processing': return 'orange';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDocumentClick = (doc) => {
    if (selectMode) {
      if (selectedDocuments.includes(doc.id)) {
        setSelectedDocuments(selectedDocuments.filter(id => id !== doc.id));
      } else {
        setSelectedDocuments([...selectedDocuments, doc.id]);
      }
    } else {
      onSelectDocument(doc);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedDocuments.length > 0) {
      if (window.confirm(`Are you sure you want to delete ${selectedDocuments.length} selected document(s)?`)) {
        selectedDocuments.forEach(id => onDeleteDocument(id, null, true));
        setSelectedDocuments([]);
        setSelectMode(false);
      }
    }
  };

  const toggleSelectMode = () => {
    setSelectMode(!selectMode);
    setSelectedDocuments([]);
  };
  
  return (
    <div className="dashboard">
      <div className="dashboard-header" style={{ position: 'relative' }}>
        <h2>Your Legal Documents</h2>
        <div className="dashboard-actions">
          <Input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button onClick={onUploadNew} className="upload-new-btn">
            Upload New Document
          </button>
          <button onClick={toggleSelectMode} className="upload-new-btn" style={{ marginLeft: '10px' }}>
            {selectMode ? 'Cancel Select' : 'Select to Delete'}
          </button>
          {selectMode && (
            <button onClick={handleDeleteSelected} className="upload-new-btn" style={{ marginLeft: '10px', backgroundColor: '#c53030' }}>
              Delete Selected
            </button>
          )}
        </div>
      </div>
      
      {documents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>No documents yet</h3>
          <p>Upload your first legal document to get started with AI analysis</p>
          <button onClick={onUploadNew} className="primary-btn">
            Upload Document
          </button>
        </div>
      ) : (
        <div className="documents-grid">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className={`document-card ${selectMode && selectedDocuments.includes(doc.id) ? 'selected' : ''}`}
              onClick={() => handleDocumentClick(doc)}
              style={{ position: 'relative' }}
            >
              {selectMode && (
                <input
                  type="checkbox"
                  checked={selectedDocuments.includes(doc.id)}
                  onChange={() => handleDocumentClick(doc)}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    zIndex: 10,
                    transform: 'scale(1.5)'
                  }}
                />
              )}
              <div className="document-icon">📄</div>
              <div className="document-info" title={doc.filename}>
                <h4>{doc.filename}</h4>
                <div className={`status ${getStatusColor(doc.analysis_status)}`}>
                  {doc.analysis_status} - {new Date(doc.upload_date).toLocaleDateString()}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Theme Context
const ThemeContext = React.createContext();

// Main App Component
function App() {
  const [currentView, setCurrentView] = useState('upload'); // upload, dashboard, analysis
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const { toast } = useToast();
  
  useEffect(() => {
    loadDocuments();
  }, []);
  
  const loadDocuments = async () => {
    try {
      const response = await axios.get(`${API}/documents`);
      setDocuments(response.data);
      
      // If we have documents, show dashboard, otherwise show upload
      if (response.data.length > 0) {
        setCurrentView('dashboard');
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId, event, bulk = false) => {
    if (!bulk) {
      event.stopPropagation(); // Prevent document selection when clicking delete
    }
    if (bulk || window.confirm('Are you sure you want to delete this document?')) {
      try {
        const response = await axios({
          method: 'DELETE',
          url: `${API}/documents/${documentId}`,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (response.data && response.data.message === "Document deleted successfully") {
          if (!bulk) {
            alert('Document deleted successfully!');
          }
          loadDocuments(); // Refresh the documents list
        } else {
          throw new Error('Unexpected response from server');
        }
      } catch (error) {
        console.error('Delete error details:', {
          error: error,
          response: error.response,
          status: error.response?.status,
          data: error.response?.data
        });
        if (!bulk) {
          alert('Failed to delete document. Please try again. Error: ' +
            (error.response?.data?.detail || error.message) +
            '\nStatus: ' + error.response?.status
          );
        }
      }
    }
  };
  
  const handleUploadSuccess = (uploadData) => {
    alert('Document uploaded successfully!');
    loadDocuments();
    setCurrentView('dashboard');
  };
  
  const handleSelectDocument = (document) => {
    setSelectedDocument(document);
    setCurrentView('analysis');
  };
  
  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedDocument(null);
    loadDocuments(); // Refresh documents
  };
  
  const handleUploadNew = () => {
    setCurrentView('upload');
  };
  
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <h2>Loading Legal Document AI...</h2>
      </div>
    );
  }
  
  return (
    <div className={`App ${isDarkMode ? 'dark' : ''}`}>
      <header className="app-header">
        <div className="header-content">
          <h1>⚖️ Legal Document AI Assistant</h1>
          <p>Simplify complex legal documents with AI-powered analysis</p>
        </div>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="dark-mode-toggle"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            backgroundColor: isDarkMode ? '#667eea' : '#f3f4f6',
            color: isDarkMode ? '#f3f4f6' : '#1a202c',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            fontSize: '20px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none',
            zIndex: 10,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.7)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </header>
      
      <main className="main-content">
        {currentView === 'upload' && (
          <DocumentUpload onUploadSuccess={handleUploadSuccess} />
        )}
        
        {currentView === 'dashboard' && (
          <DocumentsDashboard
            documents={documents}
            onSelectDocument={handleSelectDocument}
            onUploadNew={handleUploadNew}
            onDeleteDocument={handleDeleteDocument}
            isDarkMode={isDarkMode}
          />
        )}
        
        {currentView === 'analysis' && selectedDocument && (
          <DocumentAnalysis 
            document={selectedDocument}
            onBack={handleBackToDashboard}
          />
        )}
      </main>
      {/* Removed Emergent watermark badge */}
    </div>
  );
}

export default App;