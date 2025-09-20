import React from 'react';

function DocumentList({ documents, onDelete }) {
  return (
    <div>
      {documents.map(doc => (
        <div key={doc.id} className="document-item flex items-center justify-between p-2 border-b border-gray-200">
          <span>{doc.filename}</span>
          <button
            className="text-red-600 hover:text-red-800"
            onClick={() => onDelete(doc.id)}
            aria-label={"Delete document " + doc.filename}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default DocumentList;
