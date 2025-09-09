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
          credentials: 'include', // <-- CRITICAL: This sends the session cookie.
        });
        if (res.ok) {
          const data = await res.json();
          // Format the data from the backend to match the frontend's needs.
          const formattedProjects = data.map(p => ({
            id: p.id,
            name: p.project_name,
            created: new Date(p.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            status: 'Not Started', // You can add status to your backend model later
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
  }, []); // The empty array ensures this runs only once.

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
        credentials: 'include', // <-- CRITICAL: This sends the session cookie.
      });

      if (res.ok) {
        const newProjectData = await res.json();
        // Create the new project object for the frontend state.
        const newProject = {
          id: newProjectData.project_id,
          name: projectName,
          created: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: 'Not Started',
        };
        // Add the new project to the list and set it as active.
        setProjects(currentProjects => [...currentProjects, newProject]);
        setActiveProject(newProject);
        showToast('🚀 Project created successfully!');
        setIsModalOpen(false); // Close the modal on success.
      } else {
        const data = await res.json();
        showToast(`❌ Failed to create project: ${data.error || 'Server error'}`);
      }
    } catch (error) {
      showToast('❌ An error occurred while creating the project.');
    }
  };

  const openDeleteModal = (project) => {
    setProjectToDelete(project);
  };

  const handleDeleteProject = (projectIdToDelete) => {
    // Note: You will need to implement the backend DELETE endpoint for this to be permanent.
    setProjects(currentProjects => 
      currentProjects.filter(project => project.id !== projectIdToDelete)
    );
    setProjectToDelete(null); 
    showToast('🗑️ Project deleted successfully!');
  };
  
  // This logic decides whether to show the dashboard or the workspace
  if (activeProject && projects.some(p => p.id === activeProject.id)) {
    return (
      <div className="pt-28"> {/* Added padding-top */}
        <ProjectWorkspace
            project={activeProject}
            onBack={() => setActiveProject(null)}
            showToast={showToast}
        />
      </div>
    );
  }

  return (
    <div className="pt-28"> {/* Added padding-top */}
      <ProjectsDashboard
        projects={projects}
        onProjectClick={setActiveProject}
        onCreateClick={() => setIsModalOpen(true)}
        onDeleteClick={openDeleteModal}
      />
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

