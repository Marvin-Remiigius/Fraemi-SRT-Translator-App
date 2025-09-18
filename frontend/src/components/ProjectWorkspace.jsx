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
  const [allFiles, setAllFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('en');
  const fileInputRef = useRef(null);

  const fetchExistingFiles = async () => {
    if (!project || !project.id) {
      console.error('Project or project.id is undefined. Skipping fetchExistingFiles.');
      return;
    }
    try {
      const res = await fetch(`/api/projects/${project.id}/files`);
      if (res.ok) {
        const files = await res.json();
        setAllFiles(files);
          if (files.length > 0) {
            const translated = files.filter(f => f.filename.startsWith('t_'));
            if (translated.length > 0) {
              setTranslatedFiles(translated.map(f => ({
                id: f.id,
                name: f.filename,
                content: f.original_content,
                translatedContent: f.translated_content || f.original_content,
                project_id: project.id,
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
          } else {
            setStage('upload');
          }
      }
    } catch (error) {
      console.error('Error fetching existing files:', error);
    }
  };

  useEffect(() => {
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
            target_language: targetLanguage,
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

        // After successful translation, fetch the translated file with "t_" prefix
        const translatedFilename = `t_${file.name.replace(/\.srt$/, '')}_translated.srt`;
        const translatedFileRes = await fetch(`/api/projects/${project.id}/files`);
        if (translatedFileRes.ok) {
          const allFiles = await translatedFileRes.json();
          const translatedFile = allFiles.find(f => f.filename === translatedFilename);
          if (translatedFile) {
            translatedFilesResults.push({
              id: translatedFile.id,
              name: translatedFile.filename,
              content: translatedFile.original_content,
              translatedContent: translatedFile.original_content,
              status: 'success',
            });
          }
        }
      } catch (error) {
        showToast(`Error translating ${file.name}: ${error.message}`);
        setIsLoading(false);
        return;
      }
    }

    // Filter out duplicates by filename
    const uniqueTranslatedFiles = [];
    const seenNames = new Set();
    for (const f of translatedFilesResults) {
      if (!seenNames.has(f.name)) {
        uniqueTranslatedFiles.push(f);
        seenNames.add(f.name);
      }
    }

    setTranslatedFiles(uniqueTranslatedFiles);
    setIsLoading(false);
    setStage('editor');
    fetchExistingFiles(); // Refresh allFiles
  };

  const handleRemoveFile = (fileNameToRemove) => {
    const newFiles = uploadedFiles.filter(file => file.name !== fileNameToRemove);
    setUploadedFiles(newFiles);
    if (newFiles.length === 0) {
      setStage('upload');
    }
  };

  const handleDownload = async (fileId, filename) => {
    try {
      const res = await fetch(`/api/srt-files/${fileId}/download`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // Use the original filename for download, but ensure it ends with .srt
        let downloadFilename = filename;
        if (!downloadFilename.toLowerCase().endsWith('.srt')) {
          downloadFilename += '.srt';
        }
        a.download = downloadFilename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        showToast('Failed to download file');
      }
    } catch (error) {
      showToast('Error downloading file');
    }
  };

  const handleEdit = (file) => {
    const isTranslatedFile = file.filename.startsWith('t_');
    const fileObj = {
      id: file.id,
      name: file.filename,
      content: file.original_content,
      translatedContent: isTranslatedFile ? file.original_content : file.original_content,
      isTranslatedFile: isTranslatedFile,
      project_id: project.id,
    };
    setTranslatedFiles([fileObj]);
    setStage('editor');
  };

  // Add a callback to refresh files after save
  const refreshFilesAfterSave = async () => {
    await fetchExistingFiles();
    // Update the translatedFiles with the latest content from DB
    if (translatedFiles.length > 0) {
      const updatedFile = allFiles.find(f => f.id === translatedFiles[0].id);
      if (updatedFile) {
        setTranslatedFiles([{
          id: updatedFile.id,
          name: updatedFile.filename,
          content: updatedFile.original_content,
          translatedContent: updatedFile.translated_content || updatedFile.original_content,
        }]);
      }
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

      {allFiles.length > 0 && (
        <div className="bg-gray-800 p-8 rounded-xl mb-8">
          <h2 className="text-2xl font-bold mb-4">Project Files</h2>
          <ul className="space-y-3">
            {allFiles.map((file) => (
              <li key={file.id} className="bg-gray-900 p-4 rounded-lg flex justify-between items-center text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-gray-300">{file.filename}</span>
                  <span className={`text-xs px-2 py-1 rounded ${file.filename.startsWith('t_') ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}`}>
                    {file.filename.startsWith('t_') ? 'Translated' : 'Original'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(file)}
                    className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-1 px-3 rounded-lg text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDownload(file.id, file.filename)}
                    className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-1 px-3 rounded-lg text-xs"
                  >
                    Download
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

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
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label htmlFor="language-select" className="text-gray-300">Target Language:</label>
                  <select
                    id="language-select"
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                    <option value="pt">Portuguese</option>
                    <option value="ru">Russian</option>
                    <option value="ja">Japanese</option>
                    <option value="ko">Korean</option>
                    <option value="zh">Chinese</option>
                  </select>
                </div>
                <button onClick={handleTranslateAll} disabled={isLoading} className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2 px-5 rounded-lg transition-transform hover:scale-105 shadow-lg flex items-center disabled:bg-gray-500 disabled:scale-100 disabled:cursor-not-allowed">
                  {isLoading && (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  )}
                  <span>{isLoading ? 'Processing...' : `Translate All (${uploadedFiles.length})`}</span>
                </button>
              </div>
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

      {stage === 'editor' && <AdvancedEditor files={translatedFiles} showToast={showToast} onSave={refreshFilesAfterSave} projectId={project.id} />}
    </div>
  );
};

export default ProjectWorkspace;