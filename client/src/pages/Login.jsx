import { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username.trim()) {
      setError("Enter your username.");
      return;
    }

    try {
      setError("");
      setIsSubmitting(true);
      const res = await API.post("/auth/login", { username });

      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch {
      setError("Login failed. Check your username and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="login-page">
      <div className="login-card">
        <p className="eyebrow">Secure access</p>
        <h1>Enter the SafePermit command center.</h1>
        <p className="hero-copy">
          Sign in to review live work permits, QR scans, crew readiness, and field
          movement.
        </p>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleLogin();
            }
          }}
        />

        {error && <div className="alert alert--compact">{error}</div>}

        <button className="primary-action form-action" onClick={handleLogin} disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Login"}
        </button>
      </div>
    </section>
  );
}

export default Login;
