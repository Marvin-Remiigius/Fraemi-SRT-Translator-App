import React, { useState, useRef } from 'react';
import AdvancedEditor from './AdvancedEditor.jsx';

const ProjectWorkspace = ({ project, onBack, showToast }) => {
  const [stage, setStage] = useState(() => {
    if (project.hasTranslated) return 'editor';
    if (project.hasOriginal) return 'translate';
    return 'upload';
  });

  // STATE CHANGE: We now store an array of file objects
  const [uploadedFiles, setUploadedFiles] = useState([]);
  // This will hold the translated content for each file
  const [translatedFiles, setTranslatedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  // LOGIC CHANGE: This now handles multiple files
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // Use Promise.all to wait for all files to be read
    Promise.all(files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve({ name: file.name, content: e.target.result });
        reader.onerror = (e) => reject(e);
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

  const handleTranslateAll = () => {
    setIsLoading(true);
    // In a real app, you'd send all files to the backend here
    console.log("Translating all files...", uploadedFiles);
    
    // Simulate API call and receiving translated content
    setTimeout(() => {
      // For this example, we'll just create placeholder translated files
      const newTranslatedFiles = uploadedFiles.map(file => ({
        ...file,
        translatedContent: `[Translated Content for ${file.name}]`
      }));
      setTranslatedFiles(newTranslatedFiles);
      setIsLoading(false);
      setStage('editor');
    }, 2000);
  };

  return (
    <div>
      {/* INPUT CHANGE: Add the 'multiple' attribute */}
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".srt"
        multiple // This allows selecting multiple files
        style={{ display: 'none' }} 
      />

      {/* Workspace Header (unchanged) */}
      <div className="flex items-center mb-8">
        <button onClick={onBack} className="text-gray-400 hover:text-white mr-4">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>
        </button>
        <h1 className="text-4xl font-extrabold tracking-tight">{project.name}</h1>
      </div>

      {/* Stage A: Upload (unchanged) */}
      {stage === 'upload' && (
        <div className="text-center bg-gray-800 p-12 rounded-xl border-2 border-dashed border-gray-600">
          <h2 className="text-2xl font-bold mb-4">Start Your Project</h2>
          <p className="text-gray-400 mb-6">Upload the original SRT file(s) to begin the translation process.</p>
          <button onClick={handleUploadButtonClick} className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg">
            Upload Original SRT(s)
          </button>
        </div>
      )}

      {/* UI CHANGE: Stage B now shows a list of files */}
      {stage === 'translate' && (
        <div>
          <div className="bg-gray-800 p-8 rounded-xl mb-8">
            <h2 className="text-2xl font-bold mb-4">Files Uploaded</h2>
            <ul className="space-y-3">
              {uploadedFiles.map((file, index) => (
                <li key={index} className="bg-gray-900 p-3 rounded-lg flex justify-between items-center text-sm">
                  <span className="font-mono text-gray-300">{file.name}</span>
                  <span className="text-gray-500">{Math.round(file.content.length / 1024)} KB</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center justify-center space-x-4">
            <select className="bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400">
              <option>Japanese</option><option>Tamil</option><option>French</option><option>Spanish</option><option>Hindi</option>
            </select>
            <button onClick={handleTranslateAll} disabled={isLoading} className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg flex items-center disabled:bg-gray-500 disabled:scale-100">
              {isLoading && (
                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              )}
              <span>{isLoading ? 'Translating...' : `Translate All (${uploadedFiles.length})`}</span>
            </button>
          </div>
        </div>
      )}

      {/* UI CHANGE: Stage C can now switch between files */}
      {stage === 'editor' && <AdvancedEditor files={translatedFiles} showToast={showToast} />}
    </div>
  );
};

export default ProjectWorkspace;