import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to Login */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        
        {/* Future routes like /main-menu will be added here */}
      </Routes>
    </Router>
  );
}

export default App;