import React, { useState, useRef, useEffect } from 'react';
import AdvancedEditor from './AdvancedEditor.jsx';
import { UploadCloud, Trash2, Languages, Download, Edit } from 'lucide-react';

const ProjectWorkspace = ({ project, onBack, showToast }) => {
  const [originalFiles, setOriginalFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingFile, setEditingFile] = useState(null);
  const fileInputRef = useRef(null);

  const fetchProjectData = async () => {
    if (!project || !project.id) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`);
      if (res.ok) {
        const data = await res.json();
        setOriginalFiles(data.files || []);
      } else {
        showToast('Failed to fetch project data.');
      }
    } catch (error) {
      console.error('Error fetching project data:', error);
      showToast('An error occurred while fetching project data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [project.id]);

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await fetch(`/api/projects/${project.id}/upload`, {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) throw new Error(`Failed to upload ${file.name}`);
        showToast(`${file.name} uploaded successfully!`);
      } catch (error) {
        showToast(`Error uploading ${file.name}: ${error.message}`);
      }
    }
    // Reset the file input
    if(fileInputRef.current) fileInputRef.current.value = "";
    fetchProjectData(); // Refresh data after uploads
  };

  const handleTranslate = async (fileId, targetLanguage) => {
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_id: fileId, target_language: targetLanguage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Translation failed');
      showToast('Translation successful!');
      fetchProjectData(); // Refresh data
    } catch (error) {
      showToast(`Error: ${error.message}`);
    }
  };

  const handleDownload = async (fileId, originalFilename, lang) => {
    try {
        const res = await fetch(`/api/translated-files/${fileId}/download`);
        if (res.ok) {
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const filename = `${originalFilename.split('.')[0]}_${lang}.srt`;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } else {
            showToast('Failed to download file.');
        }
    } catch (error) {
        showToast('Error downloading file.');
    }
  };

  const handleSaveEdit = async () => {
    await fetchProjectData();
    setEditingFile(null); // Exit editor mode
  };

  if (isLoading) {
    return <div>Loading project...</div>;
  }

  if (editingFile) {
    return (
      <AdvancedEditor
        file={editingFile}
        showToast={showToast}
        onSave={handleSaveEdit}
        onBack={() => setEditingFile(null)}
        projectId={project.id}
      />
    );
  }

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".srt"
        multiple
        style={{ display: 'none' }}
      />
      <div className="flex items-center mb-8">
        <button onClick={onBack} className="text-gray-400 hover:text-white mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>
        </button>
        <h1 className="text-4xl font-extrabold tracking-tight">{project.project_name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Original Files Section */}
        <div className="bg-gray-800 p-6 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Original Files</h2>
            <button
              onClick={() => fileInputRef.current.click()}
              className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
            >
              <UploadCloud size={18} />
              Upload More
            </button>
          </div>
          <ul className="space-y-3">
            {originalFiles.map((file) => (
              <OriginalFileCard key={file.id} file={file} onTranslate={handleTranslate} />
            ))}
             {originalFiles.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                    <p>No original files yet.</p>
                    <p>Upload an SRT file to get started.</p>
                </div>
            )}
          </ul>
        </div>

        {/* Translated Files Section */}
        <div className="bg-gray-800 p-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">Translated Files</h2>
          <ul className="space-y-3">
            {originalFiles.flatMap(origFile =>
              origFile.translations.map(transFile => (
                <TranslatedFileCard
                  key={transFile.id}
                  originalFile={origFile}
                  translatedFile={transFile}
                  onEdit={() => setEditingFile({
                      id: transFile.id,
                      name: `${origFile.filename.split('.')[0]}_${transFile.target_language}.srt`,
                      content: transFile.content,
                      isTranslated: true
                  })}
                  onDownload={() => handleDownload(transFile.id, origFile.filename, transFile.target_language)}
                />
              ))
            ).length === 0 && (
                <div className="text-center py-10 text-gray-500">
                    <p>No translations yet.</p>
                    <p>Translate an original file to see it here.</p>
                </div>
            )}
            {originalFiles.flatMap(origFile =>
              origFile.translations.map(transFile => (
                <TranslatedFileCard
                  key={transFile.id}
                  originalFile={origFile}
                  translatedFile={transFile}
                  onEdit={() => setEditingFile({
                      id: transFile.id,
                      name: `${origFile.filename.split('.')[0]}_${transFile.target_language}.srt`,
                      content: transFile.content,
                      isTranslated: true
                  })}
                  onDownload={() => handleDownload(transFile.id, origFile.filename, transFile.target_language)}
                />
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

const OriginalFileCard = ({ file, onTranslate }) => {
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslateClick = async () => {
    setIsTranslating(true);
    await onTranslate(file.id, targetLanguage);
    setIsTranslating(false);
  };

  return (
    <li className="bg-gray-900 p-4 rounded-lg text-sm">
      <div className="font-mono text-gray-300 mb-3">{file.filename}</div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <label htmlFor={`lang-${file.id}`} className="text-xs text-gray-400">Translate to:</label>
          <select
            id={`lang-${file.id}`}
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded p-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
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
        <button
          onClick={handleTranslateClick}
          disabled={isTranslating}
          className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-1 px-3 rounded-lg text-xs flex items-center gap-1 disabled:bg-gray-500"
        >
          {isTranslating ? 'Translating...' : <><Languages size={14} /> Translate</>}
        </button>
      </div>
    </li>
  );
};

const TranslatedFileCard = ({ originalFile, translatedFile, onEdit, onDownload }) => {
  return (
    <li className="bg-gray-900 p-4 rounded-lg flex justify-between items-center text-sm">
      <div>
        <div className="font-mono text-gray-300">{originalFile.filename}</div>
        <div className="text-xs text-gray-400">
          Translated to <span className="font-bold text-green-400">{translatedFile.target_language.toUpperCase()}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-1 px-3 rounded-lg text-xs flex items-center gap-1"
        >
          <Edit size={14} /> Edit
        </button>
        <button
          onClick={onDownload}
          className="bg-green-500 hover:bg-green-400 text-white font-bold py-1 px-3 rounded-lg text-xs flex items-center gap-1"
        >
          <Download size={14} /> Download
        </button>
      </div>
    </li>
  );
};

export default ProjectWorkspace;
