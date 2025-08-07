// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './home';      // Make sure you have this file
import SignUp from './assest/signup';  // And this file
import SignIn from './assest/signin'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
      </Routes>
    </Router>
  );
}

export default App;