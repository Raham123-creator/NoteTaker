import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import SignUp from "./SignUp"
import LoginPage from "./LoginPage"
import HomePage from "./HomePage"
import AuthCallback from "./AuthCallback"
import { useAuth } from "./context/AuthContext"

// Protected route wrapper: redirects to /signin if not authenticated
function ProtectedRoute({ children }) {
  const { token } = useAuth()
  if (!token) {
    return <Navigate to="/signin" replace />
  }
  return children
}

// Redirect logic for the root "/" path
function RootRedirect() {
  const { token } = useAuth()
  return token ? <Navigate to="/notes" replace /> : <Navigate to="/signup" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        {/* Catch-all: redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}