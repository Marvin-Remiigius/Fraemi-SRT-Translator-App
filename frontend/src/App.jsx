import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // <-- IMPORT THE PROVIDER
import Home from './pages/home';
import SignUp from './assest/signup'; 
import SignIn from './assest/signin';
import ForgotPassword from './assest/forget';
import DashboardPage from './pages/Dashboardpage';
import AppHeader from './components/AppHeader'; // Make sure this path is correct

function App() {
  return (
    <Router>
      <AuthProvider> {/* <-- WRAP YOUR APP */}
        <AppHeader />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </AuthProvider> {/* <-- WRAP YOUR APP */}
    </Router>
  );
}

export default App;
