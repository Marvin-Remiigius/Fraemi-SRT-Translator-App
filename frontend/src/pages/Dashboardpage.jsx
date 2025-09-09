
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

  // --- FETCH PROJECTS FROM BACKEND ---
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/projects', {
          credentials: 'include', // <-- CRITICAL: Send cookies
        });
        if (res.ok) {
          const data = await res.json();
          const formattedProjects = data.map(p => ({
            id: p.id,
            name: p.project_name,
            created: new Date(p.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            status: 'Not Started',
          }));
          setProjects(formattedProjects);
        } else {
          console.error('Failed to fetch projects');
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

  // --- CREATE PROJECT IN BACKEND ---
  const handleCreateProject = async (projectName) => {
    try {
      const res = await fetch('http://localhost:5001/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_name: projectName }),
        credentials: 'include', // <-- CRITICAL: Send cookies
      });

      if (res.ok) {
        const newProjectData = await res.json();
        const newProject = {
          id: newProjectData.project_id,
          name: projectName,
          created: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: 'Not Started',
        };
        setProjects(currentProjects => [...currentProjects, newProject]);
        setActiveProject(newProject);
        showToast('🚀 Project created successfully!');
        setIsModalOpen(false); // Close modal on success
      } else {
        showToast('❌ Failed to create project.');
      }
    } catch (error) {
      showToast('❌ An error occurred.');
    }
  };

  const openDeleteModal = (project) => {
    setProjectToDelete(project);
  };

  const handleDeleteProject = (projectIdToDelete) => {
    // Note: You would also need to implement the backend DELETE endpoint
    setProjects(currentProjects => 
      currentProjects.filter(project => project.id !== projectIdToDelete)
    );
    setProjectToDelete(null); 
    showToast('🗑️ Project deleted successfully!');
  };

  if (activeProject && projects.some(p => p.id === activeProject.id)) {
    return (
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