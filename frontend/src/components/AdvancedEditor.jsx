import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { parseSRT, calculateCPS, getCPSColor } from '../utils/srtUtils.jsx';
import Spinner from './Spinner.jsx';

const CPS_LEGEND = [
  { label: 'Comfortable', hint: '≤ 18', dot: 'bg-emerald-400' },
  { label: 'Fast', hint: '18–25', dot: 'bg-brand' },
  { label: 'Too fast', hint: '> 25', dot: 'bg-red-500' },
];

const AdvancedEditor = ({ file, showToast, onSave, onBack }) => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

  const [parsedContent, setParsedContent] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (file?.content) {
      setParsedContent(parseSRT(file.content));
      setIsDirty(false);
    }
  }, [file]);

  const handleTextChange = (lineIndex, newText) => {
    setParsedContent((current) =>
      current.map((line, i) => (i === lineIndex ? { ...line, text: newText } : line))
    );
    setIsDirty(true);
  };

  const overLimitCount = useMemo(
    () =>
      parsedContent.filter((line) => Number(calculateCPS(line.timeline, line.text)) > 25).length,
    [parsedContent]
  );

  const handleSave = async () => {
    setIsSaving(true);
    const contentToSave = parsedContent
      .map((line) => `${line.number}\n${line.timeline}\n${line.text}`)
      .join('\n\n');

    try {
      const response = await fetch(
        `${BASE_URL}api/projects/translated-files/${file.id}/save`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: contentToSave }),
          credentials: 'include',
        }
      );
      if (!response.ok) throw new Error('Failed to save changes');
      setIsDirty(false);
      showToast('Changes saved.', 'success');
      if (onSave) onSave();
    } catch (error) {
      showToast(error.message || 'Could not save changes.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Discard them?')) return;
    onBack();
  };

  if (!file) return null;

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <button
            onClick={handleBack}
            className="mt-0.5 rounded-lg p-2 text-muted transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Back to project"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-wide text-muted uppercase">Editing</p>
            <h1 className="truncate font-mono text-lg font-bold text-white sm:text-xl">
              {file.name}
            </h1>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving || !isDirty}
          className="glow-brand inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-brand px-5 py-2.5
                     text-sm font-bold text-black transition-colors hover:bg-brand-soft
                     disabled:cursor-not-allowed disabled:bg-surface-3 disabled:text-dim disabled:shadow-none"
        >
          {isSaving ? <Spinner size={15} /> : <Save size={15} />}
          {isSaving ? 'Saving…' : isDirty ? 'Save changes' : 'Saved'}
        </button>
      </div>

      {/* CPS legend + warning */}
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-line bg-surface px-4 py-3">
        <span className="text-xs font-semibold tracking-wide text-muted uppercase">
          Reading speed
        </span>
        {CPS_LEGEND.map(({ label, hint, dot }) => (
          <span key={label} className="inline-flex items-center gap-2 text-xs text-muted">
            <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden="true" />
            {label} <span className="text-dim">{hint}</span>
          </span>
        ))}
        {overLimitCount > 0 && (
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400">
            <AlertTriangle size={13} />
            {overLimitCount} line{overLimitCount === 1 ? '' : 's'} too fast
          </span>
        )}
      </div>

      {/* Lines */}
      <div className="surface-lit overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="hidden border-b border-line px-4 py-3 text-xs font-semibold tracking-wide text-muted uppercase sm:grid sm:grid-cols-[3rem_11rem_1fr] sm:gap-4">
          <div className="text-center">#</div>
          <div>Timing</div>
          <div>Subtitle text</div>
        </div>

        <div className="custom-scrollbar max-h-[62vh] overflow-y-auto">
          {parsedContent.length === 0 ? (
            <p className="px-4 py-16 text-center text-sm text-muted">
              This file has no readable subtitle entries.
            </p>
          ) : (
            parsedContent.map((line, index) => {
              const cps = calculateCPS(line.timeline, line.text);
              const cpsColor = getCPSColor(cps);

              return (
                <div
                  key={`${line.number}-${index}`}
                  className="grid gap-2 border-b border-line px-4 py-3.5 transition-colors last:border-b-0
                             hover:bg-surface-2/40 sm:grid-cols-[3rem_11rem_1fr] sm:gap-4"
                >
                  <div className="text-xs font-semibold text-dim sm:pt-2.5 sm:text-center">
                    {line.number}
                  </div>

                  <div className="sm:pt-2">
                    <div className="font-mono text-xs leading-relaxed text-muted">
                      {line.timeline.replace(/-->/g, '→')}
                    </div>
                    <div className={`mt-1 text-xs font-bold ${cpsColor}`}>{cps} CPS</div>
                  </div>

                  <div>
                    <label className="sr-only" htmlFor={`line-${index}`}>
                      Subtitle text for entry {line.number}
                    </label>
                    <textarea
                      id={`line-${index}`}
                      value={line.text}
                      onChange={(e) => handleTextChange(index, e.target.value)}
                      rows={2}
                      className="w-full resize-y rounded-lg border border-line bg-surface-2 p-2.5 text-sm
                                 leading-relaxed text-white transition-colors
                                 focus:border-brand/50 focus:outline-none"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedEditor;
