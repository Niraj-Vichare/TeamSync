import { useAuth } from '@/context/authContext'
import { Signup } from './pages/signup-form'
import { Route, Routes, Navigate, BrowserRouter as Router, useLocation } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext';
import Dashboard from './pages/dashboard';
import CreateWorkspace from './pages/create-workspace';
import { Toaster } from 'sonner';
import InviteTeamPerson from './pages/invite-teamperson';
import SidebarLayout from './components/layout/sideNavLayout';
import PlainLayout from './components/layout/plainNavLayout';
import Task from './pages/task';
import Projects from './pages/projects';
import Project from './pages/project';
import Analytics from './pages/analytics';
// import Report from './pages/report';
import Team from './pages/team';
import Settings from './pages/setting';
import Sprints from './pages/sprints';
import "./App.css";
import { LoginForm } from './pages/login-form';
import Sprint from './pages/sprint';
import Leaderboard from './pages/leaderboard';

function App() {
  const { isAuthenticated,workspaceId,loading } = useAuth();

  return (

    <Router>
      <ThemeProvider defaultTheme="light" storageKey='vite-ui-theme'>
        {console.log(isAuthenticated,workspaceId,loading)}
        <Toaster position="top-center" richColors />
        <InnerApp isAuthenticated={isAuthenticated} workspaceId={workspaceId}
  loading={loading}/>
      </ThemeProvider>
    </Router>
  );
}

function InnerApp({ isAuthenticated,workspaceId,loading }) {
  
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  //  Not authenticated → auth flow
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route element={<PlainLayout />}>
          <Route path="/auth/signin" element={<LoginForm />} />
          <Route path="/auth/signup" element={<Signup />} />
        </Route>
        <Route path="*" element={<Navigate to="/auth/signin" replace />} />
      </Routes>
    );
  }

  // ✅ Authenticated but NO workspace → force creation
  if (!workspaceId) {
    return (
      <Routes>
        <Route element={<PlainLayout />}>
          <Route
            path="/workspace/create-workspace"
            element={<CreateWorkspace />}
          />
          <Route
            path="*"
            element={<Navigate to="/workspace/create-workspace" replace />}
          />
        </Route>
      </Routes>
    );
  }

  // Authenticated + workspace exists → full app
  return (
    <Routes>
      <Route element={<SidebarLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<Task />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:projectId" element={<Project />} />
        <Route path="/sprints" element={<Sprints />} />
        <Route path="/sprints/:sprintId" element={<Sprint />} />
        <Route path="/team" element={<Team />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
