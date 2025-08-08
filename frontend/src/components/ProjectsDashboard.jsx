import React from 'react';
import ProjectCard from './ProjectCard.jsx';

const ProjectsDashboard = ({ projects, onProjectClick, onCreateClick, onDeleteClick }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight">Projects Dashboard</h1>
        <button
          onClick={onCreateClick}
          className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2 px-6 rounded-lg transition-transform hover:scale-105 shadow-lg"
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
              onClick={() => onProjectClick(project)}
              onDeleteClick={() => onDeleteClick(project)} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center bg-gray-800 p-12 rounded-xl border-2 border-dashed border-gray-600 mt-8">
          <h2 className="text-2xl font-bold text-gray-400">No Projects Found</h2>
          <p className="text-gray-500 mt-2">Click "+ Create New Project" to get started.</p>
        </div>
      )}
    </div>
  );
};

export default ProjectsDashboard;