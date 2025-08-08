import React, { useState } from 'react';
import AdvancedEditor from './AdvancedEditor';
import { originalSRT, translatedSRT } from '../utils/srtUtils'; 

const ProjectWorkspace = ({ project, onBack, showToast }) => {
  const [stage, setStage] = useState(() => {
    if (project.hasTranslated) return 'editor';
    if (project.hasOriginal) return 'translate';
    return 'upload';
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleTranslate = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStage('editor');
    }, 2000);
  };

  return (
    <div>
      <div className="flex items-center mb-8">
        <button onClick={onBack} className="text-gray-400 hover:text-white mr-4">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>
        </button>
        <h1 className="text-4xl font-extrabold tracking-tight">{project.name}</h1>
      </div>

      {stage === 'upload' && (
        <div className="text-center bg-gray-800 p-12 rounded-xl border-2 border-dashed border-gray-600">
          <h2 className="text-2xl font-bold mb-4">Start Your Project</h2>
          <p className="text-gray-400 mb-6">Upload the original SRT file to begin the translation process.</p>
          <button onClick={() => setStage('translate')} className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg">
            Upload Original SRT
          </button>
        </div>
      )}

      {stage === 'translate' && (
        <div>
          <div className="bg-gray-800 p-8 rounded-xl mb-8">
            <h2 className="text-2xl font-bold mb-4">Original Content</h2>
            <p className="text-sm text-gray-400 mb-4">File `original-movie.srt` uploaded successfully.</p>
            <textarea readOnly value={originalSRT} className="w-full h-48 bg-gray-900 rounded-lg p-4 font-mono text-sm border border-gray-700 custom-scrollbar" />
          </div>
          <div className="flex items-center justify-center space-x-4">
            <select className="bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400">
              <option>Japanese</option><option>Tamil</option><option>French</option><option>Spanish</option><option>Hindi</option>
            </select>
            <button onClick={handleTranslate} disabled={isLoading} className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg flex items-center disabled:bg-gray-500 disabled:scale-100">
              {isLoading ? (
                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m4 13l4-4-4-4M19 17v-2a4 4 0 00-4-4H9m10 6a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              )}
              <span>{isLoading ? 'Translating...' : 'Translate'}</span>
            </button>
          </div>
        </div>
      )}

      {stage === 'editor' && <AdvancedEditor showToast={showToast} />}
    </div>
  );
};

export default ProjectWorkspace;