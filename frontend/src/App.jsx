import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './home';
import About from './pages/About';
import NotFound from './pages/NotFound';
import DashboardPage from './pages/Dashboardpage';
import SignUp from './assest/signup';
import SignIn from './assest/signin';
import ForgotPassword from './assest/forget';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Routes WITH the main header */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Routes WITHOUT the main header */}
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
