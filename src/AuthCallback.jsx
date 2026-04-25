import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext"

export default function AuthCallback() {
  const navigate = useNavigate()
  const { token: existingToken, login } = useAuth()

  useEffect(() => {
    // If we already have a token in context, it means we just logged in.
    // Stop here to prevent race conditions during navigation.
    if (existingToken) return;

    const params = new URLSearchParams(window.location.search)
    const token = params.get("token")
    const userParam = params.get("user")

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam))
        login(token, user)
        // Navigation will happen naturally as token state updates, 
        // but we force it here for immediate feedback.
        navigate("/notes", { replace: true })
      } catch (err) {
        console.error("Failed to parse user data:", err)
        navigate("/signin?error=oauth_failed", { replace: true })
      }
    } else if (token) {
      // Token exists but no user param — save token and redirect
      login(token, null)
      navigate("/notes", { replace: true })
    } else {
      // Only redirect to error if we are actually still on the callback page
      // and haven't just successfully logged in.
      if (window.location.pathname.includes("/auth/callback")) {
        console.error("No token in callback URL")
        navigate("/signin?error=oauth_failed", { replace: true })
      }
    }
  }, [existingToken, login, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F7F6F3" }}>
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#4F6EF7] border-t-transparent mb-4" />
        <p className="text-sm font-medium" style={{ color: "#6b7280" }}>Signing you in...</p>
      </div>
    </div>
  )
}
