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

function App() {
  const { isAuthenticated } = useAuth();

  return (

    <Router>
      <ThemeProvider defaultTheme="light" storageKey='vite-ui-theme'>
        {console.log(isAuthenticated)}
        <Toaster position="top-center" richColors />
        <InnerApp isAuthenticated={isAuthenticated} />
      </ThemeProvider>
    </Router>
  );
}

function InnerApp({ isAuthenticated }) {
  const { loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

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

  return (
    <Routes>
      {/* Routes with sidebar layout */}
      <Route element={<SidebarLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<Task/>}/>
        <Route path='/projects' element={<Projects/>}/>
        <Route path='/sprints' element={<Sprints/>}/>
        <Route path='/projects/:projectId' element={<Project/>}/>
        <Route path='/team' element={<Team/>}/>
        <Route path='/analytics' element={<Analytics/>}/>
        <Route path='/sprints/:sprintId' element={<Sprint/>}/>
        {/* <Route path='/report' element={<Report/>}/> */}
        <Route path='/settings' element={<Settings/>}/>
      </Route>

      {/* Routes with NO sidebar */}
      <Route element={<PlainLayout />}>
        <Route path="/workspace/create-workspace" element={<CreateWorkspace />} />
        <Route path="/workspace/invite-teamperson" element={<InviteTeamPerson />} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
