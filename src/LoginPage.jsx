import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import googleIcon from "./assets/icons8-google.svg"
import appleIcon from "./assets/icons8-apple-inc.svg"
import API from "./api/axios"
import { useAuth } from "./context/AuthContext"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const { login } = useAuth()
  const [searchParams] = useSearchParams()

  // Show Google OAuth error if redirected back with error
  const oauthError = searchParams.get("error")
  const displayError = oauthError ? (oauthError === "oauth_failed" ? "Google sign-in failed. Please try again or use email and password." : oauthError) : null

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await API.post("/api/auth/signin", { email, password })
      login(res.data.token, res.data.user)
      navigate("/notes")
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  function handleGoogleSignIn() {
    window.location.href = `${API_URL}/api/auth/google`
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "#F7F6F3" }}>
      <div className="w-full max-w-sm" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: 16, padding: 32 }}>
        <h3 className="text-2xl font-bold text-center mb-8" style={{ color: "#1a1a2e" }}>Welcome back on NoteTaker</h3>

        {/* OAuth Buttons */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 rounded-lg py-3 mb-3 text-sm transition-all duration-150"
          style={{ border: "1.5px solid #e0e0e0" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#4F6EF7"; e.currentTarget.style.background = "#fafafa" }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e0e0e0"; e.currentTarget.style.background = "transparent" }}
        >
          <img src={googleIcon} alt="Google" className="w-5 h-5" />
          Sign in with Google
        </button>

        <button
          className="w-full flex items-center justify-center gap-3 rounded-lg py-3 mb-3 text-sm transition-all duration-150"
          style={{ border: "1.5px solid #e0e0e0" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#4F6EF7"; e.currentTarget.style.background = "#fafafa" }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e0e0e0"; e.currentTarget.style.background = "transparent" }}
        >
          <img src={appleIcon} alt="Apple" className="w-5 h-5" />
          Sign in with Apple
        </button>

        <button
          className="w-full flex items-center justify-center rounded-lg py-3 mb-6 text-sm transition-all duration-150"
          style={{ border: "1.5px solid #e0e0e0" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#4F6EF7"; e.currentTarget.style.background = "#fafafa" }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e0e0e0"; e.currentTarget.style.background = "transparent" }}
        >
          Sign in with SSO
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px" style={{ background: "#e0e0e0" }} />
          <div className="flex-1 h-px" style={{ background: "#e0e0e0" }} />
        </div>

        {/* Error message */}
        {(error || displayError) && (
          <div className="mb-4 rounded-lg px-4 py-2.5 text-sm" style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#ef4444" }}>
            {error || displayError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm mb-1 text-left" style={{ color: "#6b7280" }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full text-sm outline-none"
              style={{ border: "1.5px solid #e0e0e0", borderRadius: 10, padding: "10px 14px" }}
              onFocus={(e) => { e.target.style.borderColor = "#4F6EF7"; e.target.style.boxShadow = "0 0 0 3px rgba(79,110,247,0.1)" }}
              onBlur={(e) => { e.target.style.borderColor = "#e0e0e0"; e.target.style.boxShadow = "none" }}
              required />
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm" style={{ color: "#6b7280" }}>Password</label>
              <a href="#" className="text-sm hover:underline" style={{ color: "#9ca3af" }}>
                Forgot your password?
              </a>
            </div>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm outline-none pr-10"
                style={{ border: "1.5px solid #e0e0e0", borderRadius: 10, padding: "10px 14px" }}
                onFocus={(e) => { e.target.style.borderColor = "#4F6EF7"; e.target.style.boxShadow = "0 0 0 3px rgba(79,110,247,0.1)" }}
                onBlur={(e) => { e.target.style.borderColor = "#e0e0e0"; e.target.style.boxShadow = "none" }}
                required />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-gray-600"
                style={{ color: "#9ca3af" }}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7s4-7 9-7a9.96 9.96 0 015.657 1.757M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white text-sm font-semibold py-3 transition-all duration-200 disabled:opacity-50"
            style={{ background: "#4F6EF7", borderRadius: 10, boxShadow: "0 4px 14px rgba(79,110,247,0.35)" }}
            onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = "#3d5bdb"; e.currentTarget.style.transform = "translateY(-1px)" } }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#4F6EF7"; e.currentTarget.style.transform = "translateY(0)" }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm mt-5" style={{ color: "#6b7280" }}>
          Don't have an account?{" "}
          <Link to="/signup" style={{ color: "#4F6EF7", fontWeight: 600 }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}