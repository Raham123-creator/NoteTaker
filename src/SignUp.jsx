import { useState } from "react"
import googleIcon from "./assets/icons8-google.svg"
import appleIcon from "./assets/icons8-apple-inc.svg"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import API from "./api/axios"
import { useAuth } from "./context/AuthContext"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false)
  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const { login } = useAuth()
  const [searchParams] = useSearchParams()

  // Show Google OAuth error if redirected back with error
  const googleError = searchParams.get("error") === "google_failed"

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await API.post("/api/auth/signup", { fullName, username, email, password })
      login(res.data.token, res.data.user)
      navigate("/notes")
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  function handleGoogleSignUp() {
    window.location.href = `${API_URL}/api/auth/google`
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#F7F6F3" }}>
      <div className="w-full max-w-md" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: 16, padding: 32 }}>
        <h3 className="text-2xl font-bold text-center mb-6" style={{ color: "#1a1a2e" }}>Create your account</h3>

        {/* OAuth Buttons */}
        <button
          onClick={handleGoogleSignUp}
          className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 mb-3 text-sm transition-all duration-150"
          style={{ border: "1.5px solid #e0e0e0" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#4F6EF7"; e.currentTarget.style.background = "#fafafa" }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e0e0e0"; e.currentTarget.style.background = "transparent" }}
        >
          <img src={googleIcon} alt="Google" className="w-4 h-4" />
          Sign up with Google
        </button>
        <button
          className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 mb-5 text-sm transition-all duration-150"
          style={{ border: "1.5px solid #e0e0e0" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#4F6EF7"; e.currentTarget.style.background = "#fafafa" }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e0e0e0"; e.currentTarget.style.background = "transparent" }}
        >
          <img src={appleIcon} alt="Apple" className="w-4 h-4" />
          Sign up with Apple
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px" style={{ background: "#e0e0e0" }} />
          <span className="text-xs" style={{ color: "#9ca3af" }}>or</span>
          <div className="flex-1 h-px" style={{ background: "#e0e0e0" }} />
        </div>

        {/* Error Messages */}
        {(error || googleError) && (
          <div className="mb-4 rounded-lg px-4 py-2.5 text-sm" style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#ef4444" }}>
            {error || "Google sign-in failed. Please try again."}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs mb-1 text-left" style={{ color: "#6b7280" }}>Full name</label>
              <input type="text" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="w-full text-sm outline-none"
                style={{ border: "1.5px solid #e0e0e0", borderRadius: 10, padding: "8px 12px" }}
                onFocus={(e) => { e.target.style.borderColor = "#4F6EF7"; e.target.style.boxShadow = "0 0 0 3px rgba(79,110,247,0.1)" }}
                onBlur={(e) => { e.target.style.borderColor = "#e0e0e0"; e.target.style.boxShadow = "none" }}
                required />
            </div>
            <div>
              <label className="block text-xs mb-1 text-left" style={{ color: "#6b7280" }}>Username</label>
              <input type="text" placeholder="JohnDoe" value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full text-sm outline-none"
                style={{ border: "1.5px solid #e0e0e0", borderRadius: 10, padding: "8px 12px" }}
                onFocus={(e) => { e.target.style.borderColor = "#4F6EF7"; e.target.style.boxShadow = "0 0 0 3px rgba(79,110,247,0.1)" }}
                onBlur={(e) => { e.target.style.borderColor = "#e0e0e0"; e.target.style.boxShadow = "none" }}
                required />
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-xs mb-1 text-left" style={{ color: "#6b7280" }}>Email</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full text-sm outline-none"
              style={{ border: "1.5px solid #e0e0e0", borderRadius: 10, padding: "8px 12px" }}
              onFocus={(e) => { e.target.style.borderColor = "#4F6EF7"; e.target.style.boxShadow = "0 0 0 3px rgba(79,110,247,0.1)" }}
              onBlur={(e) => { e.target.style.borderColor = "#e0e0e0"; e.target.style.boxShadow = "none" }}
              required />
          </div>

          <div className="mb-5">
            <label className="block text-xs mb-1 text-left" style={{ color: "#6b7280" }}>Password</label>
            <input type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full text-sm outline-none"
              style={{ border: "1.5px solid #e0e0e0", borderRadius: 10, padding: "8px 12px" }}
              onFocus={(e) => { e.target.style.borderColor = "#4F6EF7"; e.target.style.boxShadow = "0 0 0 3px rgba(79,110,247,0.1)" }}
              onBlur={(e) => { e.target.style.borderColor = "#e0e0e0"; e.target.style.boxShadow = "none" }}
              required minLength={8} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white text-sm font-semibold py-2.5 transition-all duration-200 disabled:opacity-50"
            style={{ background: "#4F6EF7", borderRadius: 10, boxShadow: "0 4px 14px rgba(79,110,247,0.35)" }}
            onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = "#3d5bdb"; e.currentTarget.style.transform = "translateY(-1px)" } }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#4F6EF7"; e.currentTarget.style.transform = "translateY(0)" }}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-xs mt-4" style={{ color: "#6b7280" }}>
          Already have an account?{" "}
          <Link to="/signin" style={{ color: "#4F6EF7", fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}