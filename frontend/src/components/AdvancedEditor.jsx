import React, { useState, useEffect } from 'react';
import { parseSRT, calculateCPS, getCPSColor } from '../utils/srtUtils.jsx';

const AdvancedEditor = ({ file, showToast, onSave, onBack }) => {
  const [parsedContent, setParsedContent] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (file && file.content) {
      setParsedContent(parseSRT(file.content));
    }
  }, [file]);

  const handleTextChange = (lineIndex, newText) => {
    const updatedContent = [...parsedContent];
    updatedContent[lineIndex].text = newText;
    setParsedContent(updatedContent);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const contentToSave = parsedContent.map(line =>
      `${line.number}\n${line.timeline}\n${line.text}`
    ).join('\n\n');

    try {
      const response = await fetch(`/api/translated-files/${file.id}/save`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: contentToSave }),
      });
      if (!response.ok) {
        throw new Error('Failed to save changes');
      }
      showToast('✅ Changes saved successfully!');
      if (onSave) onSave();
    } catch (error) {
      showToast(`❌ Error saving changes: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!file) {
    return <div className="text-center text-gray-500">Loading editor...</div>;
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="text-gray-400 hover:text-white mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h2 className="text-2xl font-bold">Editing: {file.name}</h2>
      </div>
      
      <div className="flex justify-end mb-4">
        <button onClick={handleSave} disabled={isSaving} className="bg-green-500 hover:bg-green-400 text-white font-semibold py-2 px-5 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-gray-800 rounded-xl p-2 font-mono text-sm">
        <div className="grid grid-cols-9 gap-4 text-gray-400 font-bold p-4 border-b border-gray-700">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-3">Timeline & CPS</div>
          <div className="col-span-5 text-yellow-400">Editable Text</div>
        </div>
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
          {parsedContent.map((line, index) => {
            const cps = calculateCPS(line.timeline, line.text);
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
                    value={line.text}
                    onChange={(e) => handleTextChange(index, e.target.value)}
                    className="w-full bg-gray-900 text-white p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    rows={3}
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
