import React, { useState, useRef, useEffect } from 'react';
import AdvancedEditor from './AdvancedEditor.jsx';
import { UploadCloud, Trash2, Languages, Download, Edit, Loader } from 'lucide-react';

const ProjectWorkspace = ({ project, onBack, showToast }) => {
  const [originalFiles, setOriginalFiles] = useState([]);
  const [translatedFiles, setTranslatedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState('en');
  const fileInputRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  const fetchOriginalFiles = async () => {
    if (!project || !project.id) return;
    try {
      const res = await fetch(`/api/projects/${project.id}`);
      if (res.ok) {
        const data = await res.json();
        setOriginalFiles(data.files || []);
      } else {
        showToast('Failed to fetch original files.');
      }
    } catch (error) {
      showToast('An error occurred while fetching original files.');
    }
  };

  const fetchTranslatedFiles = async () => {
    if (!project || !project.id) return;
    try {
      const res = await fetch(`/api/projects/${project.id}/translated-files`);
      if (res.ok) {
        setTranslatedFiles(await res.json());
      } else {
        showToast('Failed to fetch translated files.');
      }
    } catch (error) {
      showToast('An error occurred while fetching translated files.');
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([fetchOriginalFiles(), fetchTranslatedFiles()]);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [project.id]);

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      await fetch(`/api/projects/${project.id}/upload`, { method: 'POST', body: formData });
    }
    if(fileInputRef.current) fileInputRef.current.value = "";
    fetchOriginalFiles();
  };

  const handleTranslate = async (fileId, lang) => {
    await fetch('/api/translate/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_id: fileId, target_language: lang }),
    });
    fetchTranslatedFiles();
  };

  const handleTranslateAll = async () => {
    setIsTranslating(true);
    const filesToTranslate = originalFiles.filter(
      (file) => !translatedFiles.some((t) => t.original_filename === file.filename && t.target_language === targetLanguage)
    );
    if (filesToTranslate.length === 0) {
      showToast('All files are already translated to this language.');
      setIsTranslating(false);
      return;
    }
    
    await fetch(`/api/translate/${project.id}/translate-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_language: targetLanguage }),
    });

    pollingIntervalRef.current = setInterval(async () => {
      await fetchTranslatedFiles();
    }, 2000);
  };
  
  useEffect(() => {
    if (isTranslating) {
      const filesToTranslate = originalFiles.filter(
        (file) => !translatedFiles.some((t) => t.original_filename === file.filename && t.target_language === targetLanguage)
      );
      if (translatedFiles.length >= originalFiles.length && filesToTranslate.length === 0) {
        clearInterval(pollingIntervalRef.current);
        setIsTranslating(false);
        showToast('Bulk translation complete!');
      }
    }
  }, [translatedFiles, isTranslating]);


  const handleDelete = async (fileId) => {
    await fetch(`/api/projects/srt-files/${fileId}`, { method: 'DELETE' });
    fetchOriginalFiles();
  };

  const handleDownload = async (fileId, originalFilename, lang) => {
    const res = await fetch(`/api/projects/translated-files/${fileId}/download`);
    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${originalFilename.split('.')[0]}_${lang}.srt`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  if (isLoading) return <div>Loading project...</div>;

  if (editingFile) {
    return (
      <AdvancedEditor
        file={editingFile}
        showToast={showToast}
        onSave={() => { fetchTranslatedFiles(); setEditingFile(null); }}
        onBack={() => setEditingFile(null)}
      />
    );
  }

  return (
    <div>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".srt" multiple style={{ display: 'none' }} />
      <div className="flex items-center mb-8">
        <button onClick={onBack} className="text-gray-400 hover:text-white mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>
        </button>
        <h1 className="text-4xl font-extrabold tracking-tight">{project.project_name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-6 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Original Files</h2>
            <div className="flex items-center gap-2">
              <select value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)} className="bg-gray-700 border border-gray-600 rounded p-2 text-sm text-white">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
              <button onClick={handleTranslateAll} disabled={isTranslating} className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 disabled:bg-gray-500">
                {isTranslating ? <Loader className="animate-spin" size={18} /> : <Languages size={18} />}
                {isTranslating ? 'Translating...' : 'Translate All'}
              </button>
              <button onClick={() => fileInputRef.current.click()} className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                <UploadCloud size={18} /> Upload More
              </button>
            </div>
          </div>
          <ul className="space-y-3">
            {originalFiles.map((file) => (
              <OriginalFileCard key={file.id} file={file} onTranslate={handleTranslate} onDelete={handleDelete} translatedFiles={translatedFiles} />
            ))}
            {originalFiles.length === 0 && <div className="text-center py-10 text-gray-500"><p>No original files yet.</p></div>}
          </ul>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">Translated Files</h2>
          <ul className="space-y-3">
            {translatedFiles.map(file => (
              <TranslatedFileCard
                key={file.id}
                file={file}
                onEdit={() => setEditingFile({ id: file.id, name: `${file.original_filename.split('.')[0]}_${file.target_language}.srt`, content: file.content })}
                onDownload={() => handleDownload(file.id, file.original_filename, file.target_language)}
              />
            ))}
            {translatedFiles.length === 0 && <div className="text-center py-10 text-gray-500"><p>No translations yet.</p></div>}
          </ul>
        </div>
      </div>
    </div>
  );
};

const OriginalFileCard = ({ file, onTranslate, onDelete, translatedFiles }) => {
  const [lang, setLang] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslateClick = async () => {
    setIsTranslating(true);
    await onTranslate(file.id, lang);
    setIsTranslating(false);
  };

  const isTranslated = translatedFiles.some(t => t.original_filename === file.filename && t.target_language === lang);

  return (
    <li className="bg-gray-900 p-4 rounded-lg text-sm">
      <div className="flex justify-between items-center mb-3">
        <span className="font-mono text-gray-300">{file.filename}</span>
        <button onClick={() => onDelete(file.id)} className="text-gray-500 hover:text-red-400"><Trash2 size={16} /></button>
      </div>
      <div className="flex justify-between items-center">
        <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-gray-700 border border-gray-600 rounded p-1 text-xs text-white">
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </select>
        {isTranslated ? (
          <span className="text-xs font-bold text-green-400">Translated</span>
        ) : (
          <button onClick={handleTranslateClick} disabled={isTranslating} className="bg-green-500 hover:bg-green-400 text-white font-bold py-1 px-3 rounded-lg text-xs flex items-center gap-1 disabled:bg-gray-500">
            {isTranslating ? <Loader className="animate-spin" size={14} /> : <Languages size={14} />}
            Translate
          </button>
        )}
      </div>
    </li>
  );
};

const TranslatedFileCard = ({ file, onEdit, onDownload }) => (
  <li className="bg-gray-900 p-4 rounded-lg flex justify-between items-center text-sm">
    <div>
      <div className="font-mono text-gray-300">{file.original_filename}</div>
      <div className="text-xs text-gray-400">Translated to <span className="font-bold text-green-400">{file.target_language.toUpperCase()}</span></div>
    </div>
    <div className="flex gap-2">
      <button onClick={onEdit} className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-1 px-3 rounded-lg text-xs"><Edit size={14} /></button>
      <button onClick={onDownload} className="bg-green-500 hover:bg-green-400 text-white font-bold py-1 px-3 rounded-lg text-xs"><Download size={14} /></button>
    </div>
  </li>
);

export default ProjectWorkspace;
