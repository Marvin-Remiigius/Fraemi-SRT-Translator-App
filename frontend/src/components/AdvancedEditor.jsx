import React, { useState, useEffect } from 'react';
import { parseSRT, calculateCPS, getCPSColor, originalSRT, translatedSRT } from '../utils/srtUtils';

const AdvancedEditor = ({ showToast }) => {
  const [originalData] = useState(parseSRT(originalSRT));
  const [translatedData, setTranslatedData] = useState(parseSRT(translatedSRT));

  const handleTextChange = (index, newText) => {
    const updatedData = [...translatedData];
    updatedData[index].text = newText;
    setTranslatedData(updatedData);
  };
  
  return (
    <div>
      <div className="flex justify-end space-x-4 mb-6">
        <button onClick={() => showToast('✅ Changes saved successfully!')} className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-5 rounded-lg transition-colors">Save Changes</button>
        <button className="bg-green-500 hover:bg-green-400 text-black font-bold py-2 px-5 rounded-lg transition-colors">Download .srt</button>
      </div>
      <div className="bg-gray-800 rounded-xl p-2 font-mono text-sm">
        <div className="grid grid-cols-12 gap-4 text-gray-400 font-bold p-4 border-b border-gray-700">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-3">Timeline & CPS</div>
          <div className="col-span-4">Original Text</div>
          <div className="col-span-4 text-yellow-400">Translated Text (Editable)</div>
        </div>
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
          {originalData.map((original, index) => {
            const translated = translatedData[index];
            const cps = calculateCPS(original.timeline, translated.text);
            const cpsColor = getCPSColor(cps);

            return (
              <div key={original.number} className="grid grid-cols-12 gap-4 p-4 border-b border-gray-700 items-start hover:bg-gray-700/50 transition-colors">
                <div className="col-span-1 text-center text-gray-500 pt-1">{original.number}</div>
                <div className="col-span-3 text-gray-400 pt-1">
                  {original.timeline.replace(/-->/g, '→')}
                  <div className={`text-xs font-bold mt-1 ${cpsColor}`}>CPS: {cps}</div>
                </div>
                <div className="col-span-4 text-gray-300 whitespace-pre-wrap pt-1">{original.text}</div>
                <div className="col-span-4">
                  <textarea
                    value={translated.text}
                    onChange={(e) => handleTextChange(index, e.target.value)}
                    className="editable-textarea custom-scrollbar whitespace-pre-wrap"
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