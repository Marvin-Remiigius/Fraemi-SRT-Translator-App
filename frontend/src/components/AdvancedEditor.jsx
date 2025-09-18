import React, { useState, useEffect } from 'react';
import { parseSRT, calculateCPS, getCPSColor } from '../utils/srtUtils.jsx';

const AdvancedEditor = ({ files, showToast, onSave, projectId }) => {
  // State to track which file is currently being edited
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  // State to hold the data for all files
  const [filesData, setFilesData] = useState([]);
  // State for save loading
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // When files are passed as props, parse them and set up the initial state
    const parsedData = files.map(file => ({
      ...file,
      originalParsed: parseSRT(file.content),
      translatedParsed: parseSRT(file.translatedContent), // Assuming this structure
      project_id: file.project_id, // Add project_id for fetch after save
    }));
    setFilesData(parsedData);
  }, [files]);

  const handleTextChange = (lineIndex, newText) => {
    const updatedFilesData = [...filesData];
    // Determine if file is original or translated by filename prefix
    const isTranslatedFile = filesData[activeFileIndex].name.startsWith('t_');
    if (isTranslatedFile) {
      updatedFilesData[activeFileIndex].translatedParsed[lineIndex].text = newText;
    } else {
      // For original files, update originalParsed text
      updatedFilesData[activeFileIndex].originalParsed[lineIndex].text = newText;
      // Also keep translatedParsed in sync for save
      updatedFilesData[activeFileIndex].translatedParsed[lineIndex].text = newText;
    }
    setFilesData(updatedFilesData);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const activeFile = filesData[activeFileIndex];
    // Determine if file is original or translated by filename prefix
    const isTranslatedFile = activeFile.name.startsWith('t_');
    // Reconstruct the content from parsed data
    const contentToSave = (isTranslatedFile ? activeFile.translatedParsed : activeFile.originalParsed).map(line =>
      `${line.number}\n${line.timeline}\n${line.text}\n`
    ).join('\n');

    try {
      const response = await fetch(`/api/srt-files/${activeFile.id}/save`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ translated_content: contentToSave }),
      });
      if (!response.ok) {
        throw new Error('Failed to save changes');
      }
      // After successful save, fetch updated content from DB
      const fetchRes = await fetch(`/api/projects/${activeFile.project_id}/files`);
      if (fetchRes.ok) {
        const allFiles = await fetchRes.json();
        const updatedFile = allFiles.find(f => f.id === activeFile.id);
        if (updatedFile) {
          // Use translated_content if available for translated files, else original_content
          const contentToParse = isTranslatedFile && updatedFile.translated_content ? updatedFile.translated_content : updatedFile.original_content;
          const updatedParsed = parseSRT(contentToParse);
          const updatedFilesData = [...filesData];
          if (isTranslatedFile) {
            updatedFilesData[activeFileIndex].translatedParsed = updatedParsed;
          } else {
            updatedFilesData[activeFileIndex].originalParsed = updatedParsed;
            updatedFilesData[activeFileIndex].translatedParsed = updatedParsed;
          }
          setFilesData(updatedFilesData);
        }
      }
      showToast('✅ Changes saved successfully!');
      if (onSave) onSave();
    } catch (error) {
      showToast(`❌ Error saving changes: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/srt-files/${filesData[activeFileIndex].id}/download`);
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filesData[activeFileIndex].name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('✅ File downloaded successfully!');
    } catch (error) {
      showToast(`❌ Error downloading file: ${error.message}`);
    }
  };
  
  const activeFileData = filesData[activeFileIndex];

  if (!activeFileData) {
    return <div className="text-center text-gray-500">Loading editor...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        {/* File Selector Dropdown */}
        <select 
          value={activeFileIndex}
          onChange={(e) => setActiveFileIndex(Number(e.target.value))}
          className="bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          {filesData.map((file, index) => (
            <option key={index} value={index}>{file.name}</option>
          ))}
        </select>
        
        <div className="flex space-x-4">
          <button onClick={handleSave} disabled={isSaving} className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-5 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          <button onClick={handleDownload} className="bg-green-500 hover:bg-green-400 text-black font-bold py-2 px-5 rounded-lg transition-colors">Download .srt</button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-2 font-mono text-sm">
        {/* Editor Header */}
        <div className="grid grid-cols-9 gap-4 text-gray-400 font-bold p-4 border-b border-gray-700">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-3">Timeline & CPS</div>
          <div className="col-span-5 text-yellow-400">Editable Text</div>
        </div>
        {/* Editor Rows */}
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
          {activeFileData.originalParsed.map((original, index) => {
            // Determine if file is translated
            const isTranslatedFile = activeFileData.name.startsWith('t_');
            // Show editable text based on file type
            const editableText = isTranslatedFile ? activeFileData.translatedParsed[index]?.text : activeFileData.originalParsed[index]?.text;
            if (editableText === undefined) return null; // Handle missing lines
            const cps = calculateCPS(original.timeline, editableText);
            const cpsColor = getCPSColor(cps);

            return (
              <div key={original.number} className="grid grid-cols-9 gap-4 p-4 border-b border-gray-700 items-start hover:bg-gray-700/50 transition-colors">
                <div className="col-span-1 text-center text-gray-500 pt-1">{original.number}</div>
                <div className="col-span-3 text-gray-400 pt-1">
                  {original.timeline.replace(/-->/g, '→')}
                  <div className={`text-xs font-bold mt-1 ${cpsColor}`}>CPS: {cps}</div>
                </div>
                <div className="col-span-5">
                  <textarea
                    value={editableText}
                    onChange={(e) => handleTextChange(index, e.target.value)}
                    className="editable-textarea custom-scrollbar whitespace-pre-wrap bg-yellow-100 p-[1mm] border border-orange-400"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdvancedEditor;