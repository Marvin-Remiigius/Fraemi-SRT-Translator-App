import React, { useState } from 'react';
import AppHeader from '../components/AppHeader.jsx';
import ProjectsDashboard from '../components/ProjectsDashboard.jsx';
import ProjectWorkspace from '../components/ProjectWorkspace.jsx';
import CreateProjectModal from '../components/CreateProjectModal.jsx';
import Toast from '../components/Toast.jsx';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal.jsx';

const DashboardPage = () => {
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '' });

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const handleCreateProject = (projectName) => {
    const newProject = {
      id: Date.now(),
      name: projectName,
      created: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Not Started',
      targetLang: 'N/A',
      hasOriginal: false,
      hasTranslated: false,
    };
    setProjects(currentProjects => [...currentProjects, newProject]);
    setActiveProject(newProject);
    showToast('🚀 Project created successfully!');
  };

  const openDeleteModal = (project) => {
    setProjectToDelete(project);
  };

  const handleDeleteProject = (projectIdToDelete) => {
    setProjects(currentProjects => 
      currentProjects.filter(project => project.id !== projectIdToDelete)
    );
    setProjectToDelete(null); 
    showToast('🗑️ Project deleted successfully!');
  };

  if (activeProject && projects.some(p => p.id === activeProject.id)) {
    return (
      <>
        <AppHeader />
        <main className="container mx-auto p-6 lg:p-8">
          <ProjectWorkspace
            project={activeProject}
            onBack={() => setActiveProject(null)}
            showToast={showToast}
          />
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <main className="container mx-auto p-6 lg:p-8">
        <ProjectsDashboard
          projects={projects}
          onProjectClick={setActiveProject}
          onCreateClick={() => setIsModalOpen(true)}
          onDeleteClick={openDeleteModal}
        />
      </main>
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateProject}
      />
      <DeleteConfirmationModal
        project={projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDeleteProject}
      />
      <Toast message={toast.message} show={toast.show} />
    </>
  );
};

export default DashboardPage;