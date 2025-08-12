
import React from 'react';

const StatusBadge = ({ status }) => {
  const colorClasses = {
    'Completed': 'bg-green-500/20 text-green-400',
    'In Progress': 'bg-yellow-500/20 text-yellow-400',
    'Not Started': 'bg-red-500/20 text-red-400',
  };
  return (
    <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded-full ${colorClasses[status] || 'bg-gray-500/20 text-gray-400'}`}>
      {status}
    </span>
  );
};

const ProjectCard = ({ project, onProjectClick, onDeleteClick }) => {
  return (
    <div 
      className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-yellow-400/20 hover:-translate-y-1 transition-all group"
    >
      <div onClick={onProjectClick} className="cursor-pointer">
        <h3 className="text-xl font-bold mb-2 truncate">{project.name}</h3>
        <p className="text-gray-400 text-sm mb-4">Created: {project.created}</p>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center">
        <StatusBadge status={project.status} />
        <button 
          onClick={(e) => {
            e.stopPropagation(); 
            onDeleteClick();
          }}
          className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const ProjectsDashboard = ({ projects, onProjectClick, onCreateClick, onDeleteClick }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight">Projects Dashboard</h1>
        <button
          onClick={onCreateClick}
          className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2 px-6 rounded-lg"
        >
          + Create New Project
        </button>
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onProjectClick={() => onProjectClick(project)}
              onDeleteClick={() => onDeleteClick(project)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-gray-800 p-12 rounded-xl text-center">
          <h2 className="text-2xl font-bold mb-2">No Projects Found</h2>
          <p className="text-gray-400">Click "+ Create New Project" to get started.</p>
        </div>
      )}
    </div> 
  );
};

export default ProjectsDashboard;