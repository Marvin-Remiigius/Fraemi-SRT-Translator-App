import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const handleCreateProject = async (projectName) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ project_name: projectName }),
      });
      if (res.ok) {
        const newProject = await res.json();
        setProjects(currentProjects => [newProject, ...currentProjects]);
        setActiveProject(newProject);
        showToast('🚀 Project created successfully!');
      } else {
        const errorData = await res.json();
        showToast(errorData.error || 'Error creating project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      showToast('Error creating project');
    }
  };

  const openDeleteModal = (project) => {
    setProjectToDelete(project);
  };

  const handleDeleteProject = async (projectIdToDelete) => {
    try {
      const res = await fetch(`/api/projects/${projectIdToDelete}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setProjects(currentProjects =>
          currentProjects.filter(project => project.id !== projectIdToDelete)
        );
        setProjectToDelete(null);
        showToast('🗑️ Project deleted successfully!');
      } else {
        showToast('Error deleting project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      showToast('Error deleting project');
    }
  };

  if (activeProject && projects.some(p => p.id === activeProject.id)) {
    return (
      // Add pt-24 to push content down from the fixed header
      <div className="pt-24">
        <main className="container mx-auto p-6 lg:p-8">
          <ProjectWorkspace
            project={activeProject}
            onBack={() => setActiveProject(null)}
            showToast={showToast}
          />
        </main>
      </div>
    );
  }

  return (
    // Add pt-24 to push content down from the fixed header
    <div className="pt-24">
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
    </div>
  );
};

export default DashboardPage;
