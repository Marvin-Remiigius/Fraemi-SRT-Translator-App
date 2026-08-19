import React, { useState, useEffect, useCallback, useRef } from 'react';
import ProjectsDashboard from '../components/ProjectsDashboard.jsx';
import ProjectWorkspace from '../components/ProjectWorkspace.jsx';
import CreateProjectModal from '../components/CreateProjectModal.jsx';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal.jsx';
import Toast from '../components/Toast.jsx';
import { PageLoader } from '../components/Spinner.jsx';

const DashboardPage = () => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeProject, setActiveProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const toastTimerRef = useRef(null);

  // Must be stable: ProjectWorkspace lists showToast in its effect dependencies,
  // so a fresh function each render would re-trigger its data fetches in a loop.
  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(
      () => setToast((t) => ({ ...t, show: false })),
      3500
    );
  }, []);

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`${BASE_URL}api/projects/`, { credentials: 'include' });
        if (!res.ok) throw new Error('Request failed');
        setProjects(await res.json());
      } catch {
        showToast('Could not load your projects.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, [BASE_URL, showToast]);

  const handleCreateProject = async (projectName) => {
    try {
      const res = await fetch(`${BASE_URL}api/projects/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ project_name: projectName }),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Could not create the project.', 'error');
        return;
      }
      setProjects((current) => [data, ...current]);
      setActiveProject(data);
      showToast('Project created.', 'success');
    } catch {
      showToast('Could not create the project.', 'error');
    }
  };

  const handleDeleteProject = async (projectIdToDelete) => {
    try {
      const res = await fetch(`${BASE_URL}api/projects/${projectIdToDelete}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Delete failed');

      setProjects((current) => current.filter((p) => p.id !== projectIdToDelete));
      if (activeProject?.id === projectIdToDelete) setActiveProject(null);
      setProjectToDelete(null);
      showToast('Project deleted.', 'success');
    } catch {
      showToast('Could not delete the project.', 'error');
    }
  };

  const isWorkspaceOpen = activeProject && projects.some((p) => p.id === activeProject.id);

  return (
    <div className="min-h-screen pt-28 pb-16">
      <main className="mx-auto w-full max-w-6xl px-5 sm:px-6">
        {isLoading ? (
          <PageLoader label="Loading your projects…" />
        ) : isWorkspaceOpen ? (
          <ProjectWorkspace
            project={activeProject}
            onBack={() => setActiveProject(null)}
            showToast={showToast}
          />
        ) : (
          <ProjectsDashboard
            projects={projects}
            onProjectClick={setActiveProject}
            onCreateClick={() => setIsModalOpen(true)}
            onDeleteClick={setProjectToDelete}
          />
        )}
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
      <Toast message={toast.message} show={toast.show} type={toast.type} />
    </div>
  );
};

export default DashboardPage;
