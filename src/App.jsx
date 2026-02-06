import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import LoginPage from './features/auth/LoginPage';
import ProfilePage from './features/profile/ProfilePage';

function App() {
  return (
    <AuthProvider>
      <Router basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/:username" element={<ProfilePage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
