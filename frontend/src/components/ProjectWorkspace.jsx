import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  UploadCloud,
  Trash2,
  Languages,
  Download,
  Pencil,
  ArrowLeft,
  FileText,
  CheckCircle2,
  Inbox,
} from 'lucide-react';
import AdvancedEditor from './AdvancedEditor.jsx';
import Spinner from './Spinner.jsx';
import { LANGUAGES, languageLabel } from '../constants/languages.js';

// Stop polling after ~3 minutes so a failed background job can't leave the
// "Translating…" spinner running forever.
const POLL_INTERVAL_MS = 2500;
const MAX_POLL_ATTEMPTS = 72;

const LanguageSelect = ({ value, onChange, className = '', ...rest }) => (
  <select
    value={value}
    onChange={onChange}
    className={`rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-white
                transition-colors focus:border-brand/50 focus:outline-none ${className}`}
    {...rest}
  >
    {LANGUAGES.map((lang) => (
      <option key={lang.code} value={lang.code}>
        {lang.label}
      </option>
    ))}
  </select>
);

const Panel = ({ title, count, action, children }) => (
  <section className="surface-lit flex flex-col rounded-2xl border border-line bg-surface">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5">
      <h2 className="flex items-center gap-2.5 text-lg font-semibold text-white">
        {title}
        <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted">
          {count}
        </span>
      </h2>
      {action}
    </div>
    <div className="p-4">{children}</div>
  </section>
);

const EmptyPanel = ({ Icon, title, hint }) => (
  <div className="flex flex-col items-center px-4 py-14 text-center">
    <Icon size={26} className="text-dim" aria-hidden="true" />
    <p className="mt-3 text-sm font-medium text-muted">{title}</p>
    {hint && <p className="mt-1 text-xs text-dim">{hint}</p>}
  </div>
);

const ProjectWorkspace = ({ project, onBack, showToast }) => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

  const [originalFiles, setOriginalFiles] = useState([]);
  const [translatedFiles, setTranslatedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState('en');

  const fileInputRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const pollAttemptsRef = useRef(0);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    pollAttemptsRef.current = 0;
  }, []);

  const fetchOriginalFiles = useCallback(async () => {
    if (!project?.id) return;
    try {
      const res = await fetch(`${BASE_URL}api/projects/${project.id}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Request failed');
      const data = await res.json();
      setOriginalFiles(data.files || []);
    } catch {
      showToast('Could not load source files.', 'error');
    }
  }, [BASE_URL, project?.id, showToast]);

  const fetchTranslatedFiles = useCallback(async () => {
    if (!project?.id) return;
    try {
      const res = await fetch(`${BASE_URL}api/projects/${project.id}/translated-files`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Request failed');
      setTranslatedFiles(await res.json());
    } catch {
      showToast('Could not load translations.', 'error');
    }
  }, [BASE_URL, project?.id, showToast]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      await Promise.all([fetchOriginalFiles(), fetchTranslatedFiles()]);
      if (!cancelled) setIsLoading(false);
    })();

    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [fetchOriginalFiles, fetchTranslatedFiles, stopPolling]);

  const uploadFiles = async (fileList) => {
    const files = Array.from(fileList).filter((f) => f.name.toLowerCase().endsWith('.srt'));
    const rejected = fileList.length - files.length;

    if (rejected > 0) {
      showToast(`${rejected} file${rejected === 1 ? '' : 's'} skipped — only .srt is supported.`, 'error');
    }
    if (files.length === 0) return;

    setIsUploading(true);
    let failed = 0;

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await fetch(`${BASE_URL}api/projects/${project.id}/upload`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        if (!res.ok) failed++;
      } catch {
        failed++;
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
    await fetchOriginalFiles();
    setIsUploading(false);

    if (failed === 0) {
      showToast(`Uploaded ${files.length} file${files.length === 1 ? '' : 's'}.`, 'success');
    } else {
      showToast(`${failed} of ${files.length} uploads failed.`, 'error');
    }
  };

  const handleFileChange = (event) => uploadFiles(event.target.files);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files);
  };

  const handleTranslate = async (fileId, lang) => {
    try {
      const res = await fetch(`${BASE_URL}api/translate/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ file_id: fileId, target_language: lang }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Translation failed');
      }
      await fetchTranslatedFiles();
      showToast(`Translated to ${languageLabel(lang)}.`, 'success');
    } catch (error) {
      showToast(error.message || 'Translation failed.', 'error');
    }
  };

  const pendingCount = originalFiles.filter(
    (file) =>
      !translatedFiles.some(
        (t) => t.original_filename === file.filename && t.target_language === targetLanguage
      )
  ).length;

  const handleTranslateAll = async () => {
    if (pendingCount === 0) {
      showToast(`Everything is already translated to ${languageLabel(targetLanguage)}.`, 'info');
      return;
    }

    setIsTranslating(true);
    try {
      const res = await fetch(`${BASE_URL}api/translate/${project.id}/translate-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ target_language: targetLanguage }),
      });
      if (!res.ok) throw new Error('Could not start bulk translation');
    } catch (error) {
      setIsTranslating(false);
      showToast(error.message || 'Could not start bulk translation.', 'error');
      return;
    }

    pollAttemptsRef.current = 0;
    pollingIntervalRef.current = setInterval(async () => {
      pollAttemptsRef.current += 1;
      if (pollAttemptsRef.current > MAX_POLL_ATTEMPTS) {
        stopPolling();
        setIsTranslating(false);
        showToast('Translation is taking longer than expected. Refresh to check progress.', 'error');
        return;
      }
      await fetchTranslatedFiles();
    }, POLL_INTERVAL_MS);
  };

  // Bulk translation finishes when nothing is left pending for the chosen language.
  useEffect(() => {
    if (isTranslating && pendingCount === 0) {
      stopPolling();
      setIsTranslating(false);
      showToast('Bulk translation complete.', 'success');
    }
  }, [isTranslating, pendingCount, stopPolling, showToast]);

  const handleDelete = async (fileId, filename) => {
    if (!window.confirm(`Delete "${filename}" and all of its translations?`)) return;
    try {
      const res = await fetch(`${BASE_URL}api/projects/srt-files/${fileId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Delete failed');
      await Promise.all([fetchOriginalFiles(), fetchTranslatedFiles()]);
      showToast('File deleted.', 'success');
    } catch {
      showToast('Could not delete the file.', 'error');
    }
  };

  const handleDownload = async (fileId, originalFilename, lang) => {
    try {
      const res = await fetch(`${BASE_URL}api/projects/translated-files/${fileId}/download`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${originalFilename.split('.')[0]}_${lang}.srt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      showToast('Could not download the file.', 'error');
    }
  };

  if (editingFile) {
    return (
      <AdvancedEditor
        file={editingFile}
        showToast={showToast}
        onSave={() => {
          fetchTranslatedFiles();
          setEditingFile(null);
        }}
        onBack={() => setEditingFile(null)}
      />
    );
  }

  return (
    <div
      className="animate-fade-up relative"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget.contains(e.relatedTarget)) return;
        setIsDragging(false);
      }}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".srt"
        multiple
        className="hidden"
      />

      {isDragging && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur-sm">
          <div className="rounded-2xl border-2 border-dashed border-brand bg-surface px-12 py-10 text-center">
            <UploadCloud size={34} className="mx-auto text-brand" />
            <p className="mt-3 font-semibold text-white">Drop .srt files to upload</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex items-start gap-3">
        <button
          onClick={onBack}
          className="mt-1 rounded-lg p-2 text-muted transition-colors hover:bg-white/5 hover:text-white"
          aria-label="Back to projects"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-muted uppercase">Project</p>
          <h1 className="truncate text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            {project.project_name || project.name}
          </h1>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-2xl border border-line bg-surface p-5">
              <div className="h-5 w-40 animate-pulse rounded bg-surface-2" />
              <div className="mt-6 space-y-3">
                {[0, 1, 2].map((j) => (
                  <div key={j} className="h-20 animate-pulse rounded-xl bg-surface-2" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel
            title="Source files"
            count={originalFiles.length}
            action={
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center gap-2 rounded-lg bg-surface-2 px-3.5 py-2 text-sm
                           font-semibold text-white transition-colors hover:bg-line
                           disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploading ? <Spinner size={15} /> : <UploadCloud size={15} />}
                {isUploading ? 'Uploading…' : 'Upload'}
              </button>
            }
          >
            {/* Bulk translate bar */}
            {originalFiles.length > 0 && (
              <div className="mb-4 flex flex-col gap-2 rounded-xl border border-line bg-surface-2/50 p-3 sm:flex-row sm:items-center">
                <LanguageSelect
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  aria-label="Bulk translation target language"
                  className="sm:w-40"
                />
                <button
                  onClick={handleTranslateAll}
                  disabled={isTranslating}
                  className="glow-brand inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2
                             text-sm font-bold text-black transition-colors hover:bg-brand-soft
                             disabled:cursor-not-allowed disabled:bg-surface-3 disabled:text-dim disabled:shadow-none"
                >
                  {isTranslating ? <Spinner size={15} /> : <Languages size={15} />}
                  {isTranslating
                    ? 'Translating…'
                    : `Translate all${pendingCount ? ` (${pendingCount})` : ''}`}
                </button>
              </div>
            )}

            {originalFiles.length === 0 ? (
              <EmptyPanel
                Icon={Inbox}
                title="No source files yet"
                hint="Upload or drag .srt files anywhere on this page"
              />
            ) : (
              <ul className="space-y-2.5">
                {originalFiles.map((file) => (
                  <OriginalFileCard
                    key={file.id}
                    file={file}
                    onTranslate={handleTranslate}
                    onDelete={handleDelete}
                    translatedFiles={translatedFiles}
                  />
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Translations" count={translatedFiles.length}>
            {translatedFiles.length === 0 ? (
              <EmptyPanel
                Icon={Languages}
                title="No translations yet"
                hint="Translate a source file to see it here"
              />
            ) : (
              <ul className="space-y-2.5">
                {translatedFiles.map((file) => (
                  <TranslatedFileCard
                    key={file.id}
                    file={file}
                    onEdit={() =>
                      setEditingFile({
                        id: file.id,
                        name: `${file.original_filename.split('.')[0]}_${file.target_language}.srt`,
                        content: file.content,
                      })
                    }
                    onDownload={() =>
                      handleDownload(file.id, file.original_filename, file.target_language)
                    }
                  />
                ))}
              </ul>
            )}
          </Panel>
        </div>
      )}
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

  const isTranslated = translatedFiles.some(
    (t) => t.original_filename === file.filename && t.target_language === lang
  );

  return (
    <li className="rounded-xl border border-line bg-surface-2/60 p-3.5 transition-colors hover:border-white/15">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2">
          <FileText size={15} className="shrink-0 text-dim" aria-hidden="true" />
          <span className="truncate font-mono text-sm text-neutral-200" title={file.filename}>
            {file.filename}
          </span>
        </span>
        <button
          onClick={() => onDelete(file.id, file.filename)}
          className="shrink-0 rounded-lg p-1.5 text-dim transition-colors hover:bg-red-500/10 hover:text-red-400"
          aria-label={`Delete ${file.filename}`}
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          aria-label={`Target language for ${file.filename}`}
          className="flex-1 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs text-white
                     transition-colors focus:border-brand/50 focus:outline-none"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>

        {isTranslated ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
            <CheckCircle2 size={13} /> Done
          </span>
        ) : (
          <button
            onClick={handleTranslateClick}
            disabled={isTranslating}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line px-3 py-1.5
                       text-xs font-semibold text-white transition-colors hover:bg-white/5
                       disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isTranslating ? <Spinner size={13} /> : <Languages size={13} />}
            {isTranslating ? 'Working…' : 'Translate'}
          </button>
        )}
      </div>
    </li>
  );
};

const TranslatedFileCard = ({ file, onEdit, onDownload }) => (
  <li className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-2/60 p-3.5 transition-colors hover:border-white/15">
    <div className="min-w-0">
      <div className="truncate font-mono text-sm text-neutral-200" title={file.original_filename}>
        {file.original_filename}
      </div>
      <div className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">
        {languageLabel(file.target_language)}
      </div>
    </div>

    <div className="flex shrink-0 gap-1.5">
      <button
        onClick={onEdit}
        className="rounded-lg p-2 text-muted transition-colors hover:bg-white/5 hover:text-white"
        aria-label={`Edit ${file.original_filename}`}
        title="Edit"
      >
        <Pencil size={15} />
      </button>
      <button
        onClick={onDownload}
        className="rounded-lg p-2 text-muted transition-colors hover:bg-white/5 hover:text-white"
        aria-label={`Download ${file.original_filename}`}
        title="Download"
      >
        <Download size={15} />
      </button>
    </div>
  </li>
);

export default ProjectWorkspace;
