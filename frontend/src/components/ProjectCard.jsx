import React from 'react';
import { Trash2, FileText, Languages, CalendarDays, ArrowUpRight } from 'lucide-react';

const Meta = ({ Icon, children }) => (
  <span className="inline-flex items-center gap-1.5 text-xs text-muted">
    <Icon size={13} aria-hidden="true" />
    {children}
  </span>
);

const ProjectCard = ({ project, onClick, onDeleteClick }) => {
  // These counts are optional — older API responses omit them, so only render
  // a badge when the backend actually sent a number.
  const fileCount = project.file_count;
  const translationCount = project.translation_count;

  return (
    <div
      className="surface-lit group relative rounded-2xl border border-line bg-surface p-5 transition-all
                 hover:-translate-y-0.5 hover:border-brand/35 hover:shadow-xl hover:shadow-black/50
                 focus-within:border-brand/35"
    >
      {/* Full-card click target, sits behind the content. */}
      <button
        type="button"
        onClick={onClick}
        className="absolute inset-0 z-0 rounded-2xl"
        aria-label={`Open project ${project.name}`}
      />

      <div className="pointer-events-none relative z-10">
        {/* pr-10 keeps the title clear of the delete button. */}
        <h3 className="truncate pr-10 text-lg font-semibold text-white" title={project.name}>
          {project.name}
        </h3>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4">
          <Meta Icon={CalendarDays}>{project.created}</Meta>
          {typeof fileCount === 'number' && (
            <Meta Icon={FileText}>
              {fileCount} {fileCount === 1 ? 'file' : 'files'}
            </Meta>
          )}
          {typeof translationCount === 'number' && translationCount > 0 && (
            <Meta Icon={Languages}>{translationCount} translated</Meta>
          )}
          <span className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-dim transition-colors group-hover:text-brand">
            Open <ArrowUpRight size={13} aria-hidden="true" />
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDeleteClick();
        }}
        className="absolute top-3 right-3 z-20 rounded-lg p-2 text-dim opacity-100 transition-all
                   hover:bg-red-500/10 hover:text-red-400 focus-visible:opacity-100
                   md:opacity-0 md:group-hover:opacity-100"
        aria-label={`Delete project ${project.name}`}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

export default ProjectCard;
