import React, { useState, useRef, useEffect } from 'react';
import AdvancedEditor from './AdvancedEditor.jsx';
import { Trash2 } from 'lucide-react';

const StatusIndicator = ({ status }) => {
  const baseClasses = "text-xs font-bold uppercase tracking-wider";
  
  switch (status) {
    case 'uploading':
      return <div className={`${baseClasses} text-blue-400 flex items-center`}>
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        Uploading...
      </div>;
    case 'translating':
      return <div className={`${baseClasses} text-purple-400 flex items-center`}>
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        Translating...
      </div>;
    case 'success':
      return <div className={`${baseClasses} text-green-400`}>✅ Success</div>;
    default:
      return <div className={`${baseClasses} text-gray-500`}>Pending</div>;
  }
};


const ProjectWorkspace = ({ project, onBack, showToast }) => {
  const [stage, setStage] = useState('upload');

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [translatedFiles, setTranslatedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchExistingFiles = async () => {
      try {
        const res = await fetch(`/api/projects/${project.id}/files`);
        if (res.ok) {
          const files = await res.json();
          if (files.length > 0) {
            const translated = files.filter(f => f.translated_content);
            if (translated.length > 0) {
              setTranslatedFiles(translated.map(f => ({
                id: f.id,
                name: f.filename,
                content: f.original_content,
                translatedContent: f.translated_content,
              })));
              setStage('editor');
            } else {
              setUploadedFiles(files.map(f => ({
                id: f.id,
                name: f.filename,
                content: f.original_content,
                status: 'success',
              })));
              setStage('translate');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching existing files:', error);
      }
    };

    fetchExistingFiles();
  }, [project.id]);

  const delay = (ms) => new Promise(res => setTimeout(res, ms));

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    Promise.all(files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve({ name: file.name, content: e.target.result, status: 'pending' });
        reader.readAsText(file);
      });
    })).then(fileContents => {
      setUploadedFiles(fileContents);
      setStage('translate');
    });
  };
  
  const handleUploadButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleTranslateAll = async () => {
    setIsLoading(true);
    setUploadedFiles(prevFiles => prevFiles.map(f => ({ ...f, status: 'uploading' })));

    // Upload files to backend
    const uploadedFileIds = [];
    for (const file of uploadedFiles) {
      const formData = new FormData();
      formData.append('file', new Blob([file.content], { type: 'text/plain' }), file.name);
      try {
        const uploadRes = await fetch(`/api/projects/${project.id}/upload`, {
          method: 'POST',
          body: formData,
        });
        if (!uploadRes.ok) {
          throw new Error(`Failed to upload file ${file.name}`);
        }
        const uploadData = await uploadRes.json();
        uploadedFileIds.push({ id: uploadData.file_id, name: file.name, content: file.content });
      } catch (error) {
        showToast(`Error uploading ${file.name}: ${error.message}`);
        setIsLoading(false);
        return;
      }
    }

    setUploadedFiles(prevFiles => prevFiles.map(f => ({ ...f, status: 'translating' })));

    // Translate files using backend API
    const translatedFilesResults = [];
    for (const file of uploadedFileIds) {
      try {
        const translateRes = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            srt_content: file.content,
            target_language: 'en', // You may want to make this dynamic
            file_id: file.id,
          }),
        });
        if (!translateRes.ok) {
          throw new Error(`Failed to translate file ${file.name}`);
        }
        const translateData = await translateRes.json();
        translatedFilesResults.push({
          id: file.id,
          name: file.name,
          content: file.content,
          translatedContent: translateData.translated_srt,
          status: 'success',
        });
      } catch (error) {
        showToast(`Error translating ${file.name}: ${error.message}`);
        setIsLoading(false);
        return;
      }
    }

    setTranslatedFiles(translatedFilesResults);
    setIsLoading(false);
    setStage('editor');
  };

  const handleRemoveFile = (fileNameToRemove) => {
    const newFiles = uploadedFiles.filter(file => file.name !== fileNameToRemove);
    setUploadedFiles(newFiles);
    if (newFiles.length === 0) {
      setStage('upload');
    }
  };

  return (
    <div>
      <input 
        type="file" ref={fileInputRef} onChange={handleFileChange}
        accept=".srt" multiple style={{ display: 'none' }} 
      />
      <div className="flex items-center mb-8">
        <button onClick={onBack} className="text-gray-400 hover:text-white mr-4">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>
        </button>
        <h1 className="text-4xl font-extrabold tracking-tight">{project.project_name}</h1>
      </div>

      {stage === 'upload' && (
        <div className="text-center bg-gray-800 p-12 rounded-xl border-2 border-dashed border-gray-600">
          <h2 className="text-2xl font-bold mb-4">Start Your Project</h2>
          <p className="text-gray-400 mb-6">Upload the original SRT file(s) to begin the translation process.</p>
          <button onClick={handleUploadButtonClick} className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg">
            Upload Original SRT(s)
          </button>
        </div>
      )}

      {stage === 'translate' && (
        <div>
          <div className="bg-gray-800 p-8 rounded-xl mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Files Ready for Translation</h2>
              <button onClick={handleTranslateAll} disabled={isLoading} className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2 px-5 rounded-lg transition-transform hover:scale-105 shadow-lg flex items-center disabled:bg-gray-500 disabled:scale-100 disabled:cursor-not-allowed">
                {isLoading && (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                )}
                <span>{isLoading ? 'Processing...' : `Translate All (${uploadedFiles.length})`}</span>
              </button>
            </div>
            <ul className="space-y-3">
              {uploadedFiles.map((file, index) => (
                <li key={index} className="bg-gray-900 p-4 rounded-lg flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleRemoveFile(file.name)}
                      className="text-gray-500 hover:text-red-400 transition-colors"
                      aria-label={`Remove ${file.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                    <span className="font-mono text-gray-300">{file.name}</span>
                  </div>
                  <StatusIndicator status={file.status} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {stage === 'editor' && <AdvancedEditor files={translatedFiles} showToast={showToast} />}
    </div>
  );
};

export default ProjectWorkspace;