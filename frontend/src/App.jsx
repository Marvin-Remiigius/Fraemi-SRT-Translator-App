
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './home'; 
import SignUp from './assest/signup'; 
import SignIn from './assest/signin';
import ForgotPassword from './assest/forget';
import DashboardPage from './pages/Dashboardpage';
import Layout from './components/Layout'; // <-- IMPORT THE NEW LAYOUT

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Routes WITH the main header */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="dashboard" element={<DashboardPage />} />
            {/* Add other pages that need the header here, e.g., /about */}
          </Route>

          {/* Routes WITHOUT the main header */}
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
