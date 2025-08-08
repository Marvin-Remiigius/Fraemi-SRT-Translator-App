import React from 'react';
import { Trash2 } from 'lucide-react';

const ProjectCard = ({ project, onClick, onDeleteClick }) => {
  const statusColors = {
    'Completed': 'text-green-400',
    'In Progress': 'text-yellow-400',
    'Not Started': 'text-red-400'
  };

  return (
    <div
      onClick={onClick}
      className="relative bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-yellow-400/20 hover:-translate-y-1 transition-all cursor-pointer"
    >
      <button
        onClick={(e) => {
          e.stopPropagation(); 
          onDeleteClick();
        }}
        className="absolute top-3 right-3 p-1.5 text-gray-500 hover:bg-red-500/20 hover:text-red-400 rounded-full transition-colors"
        aria-label="Delete project"
      >
        <Trash2 size={18} />
      </button>

      <h3 className="text-xl font-bold mb-2 pr-8 truncate">{project.name}</h3>
      <p className="text-gray-400 text-sm">Created: {project.created}</p>
      <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center">
        <span className={`text-xs font-semibold uppercase tracking-wider ${statusColors[project.status]}`}>
          {project.status}
        </span>
        <div className="text-gray-400 text-sm">Target: {project.targetLang}</div>
      </div>
    </div>
  );
};

export default ProjectCard;