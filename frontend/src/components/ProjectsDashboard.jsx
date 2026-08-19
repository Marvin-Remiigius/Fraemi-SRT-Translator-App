import React, { useState, useMemo } from 'react';
import { Plus, Search, FolderPlus } from 'lucide-react';
import ProjectCard from './ProjectCard.jsx';

const ProjectsDashboard = ({ projects, onProjectClick, onCreateClick, onDeleteClick }) => {
  const [query, setQuery] = useState('');

  const visibleProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => p.name?.toLowerCase().includes(q));
  }, [projects, query]);

  return (
    <div className="animate-fade-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Projects
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {projects.length === 0
              ? 'No projects yet'
              : `${projects.length} ${projects.length === 1 ? 'project' : 'projects'}`}
          </p>
        </div>

        <button
          onClick={onCreateClick}
          className="glow-brand inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-brand px-5 py-2.5
                     text-sm font-semibold text-black transition-colors hover:bg-brand-soft"
        >
          <Plus size={17} /> New project
        </button>
      </div>

      {projects.length > 3 && (
        <div className="relative mt-6 max-w-sm">
          <Search
            size={16}
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-dim"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects…"
            aria-label="Search projects"
            className="w-full rounded-full border border-line bg-surface py-2.5 pr-4 pl-10 text-sm
                       text-white placeholder-dim transition-colors
                       focus:border-brand/50 focus:outline-none"
          />
        </div>
      )}

      {projects.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-surface/50 px-6 py-20 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand/10 text-brand">
            <FolderPlus size={26} />
          </span>
          <h2 className="mt-5 text-xl font-semibold text-white">Create your first project</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
            A project holds your source <span className="font-mono">.srt</span> files and every
            translation you generate from them.
          </p>
          <button
            onClick={onCreateClick}
            className="glow-brand mt-7 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5
                       text-sm font-semibold text-black transition-colors hover:bg-brand-soft"
          >
            <Plus size={17} /> New project
          </button>
        </div>
      ) : visibleProjects.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-line bg-surface px-6 py-16 text-center">
          <p className="text-sm text-muted">
            No projects match “<span className="text-white">{query}</span>”.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => onProjectClick(project)}
              onDeleteClick={() => onDeleteClick(project)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsDashboard;
