import React, { useState, useEffect } from 'react';
import { parseSRT, calculateCPS, getCPSColor } from '../utils/srtUtils.jsx';

const AdvancedEditor = ({ files, showToast, onSave, projectId }) => {
  // State to track which file is currently being edited
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  // State to hold the data for all files with unified parsed content
  const [filesData, setFilesData] = useState([]);
  // State for save loading
  const [isSaving, setIsSaving] = useState(false);

  const [hasEdits, setHasEdits] = React.useState(false);

  useEffect(() => {
    // Initialize parsedContent only if no edits have been made yet
    if (!hasEdits) {
      const parsedData = files.map(file => ({
        ...file,
        parsedContent: parseSRT(file.translatedContent || file.content), // Use translatedContent if available, else original content
        project_id: file.project_id, // Add project_id for fetch after save
      }));
      setFilesData(parsedData);
    }
  }, [files, hasEdits]);

  const handleTextChange = (lineIndex, newText) => {
    const updatedFilesData = [...filesData];
    updatedFilesData[activeFileIndex].parsedContent[lineIndex].text = newText;
    setFilesData(updatedFilesData);
    setHasEdits(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const activeFile = filesData[activeFileIndex];
    // Reconstruct the content from parsed data
    const contentToSave = activeFile.parsedContent.map(line =>
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
      // No state update or fetch after save to keep editable content unchanged
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
          {activeFileData.parsedContent.map((line, index) => {
            const editableText = line.text;
            const cps = calculateCPS(line.timeline, editableText);
            const cpsColor = getCPSColor(cps);

            return (
              <div key={line.number} className="grid grid-cols-9 gap-4 p-4 border-b border-gray-700 items-start hover:bg-gray-700/50 transition-colors">
                <div className="col-span-1 text-center text-gray-500 pt-1">{line.number}</div>
                <div className="col-span-3 text-gray-400 pt-1">
                  {line.timeline.replace(/-->/g, '→')}
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
