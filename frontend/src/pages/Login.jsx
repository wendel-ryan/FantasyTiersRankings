import { useState } from "react";
import { login } from "../services/auth";
import "../styles/Login.css";
import { Link } from "react-router-dom";
import Logo from "../assets/LogoWords.png";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(email, password);

      localStorage.setItem("access_token", response.access_token);
      navigate("/home");
      setMessage("Successful login");
    } catch (err) {
      console.log(err);
      if (err.response && err.response.status === 401) {
        setMessage("Incorrect email or password.");
      } else {
        setMessage("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <section className="login-page">
      <div className="login-logo-container">
        <img className="login-logo" src={Logo}></img>
      </div>
      <div className="container login-container">
        <form onSubmit={handleSubmit} className="login-form">
          <h1>Login</h1>
          <label for="email-address">Email Address:</label>
          <input
            value={email}
            placeholder="Email Address"
            onChange={(e) => setEmail(e.target.value)}
          />
          <label for="password">Password:</label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button>Login</button>

          {message && <p className="message">{message}</p>}

          <p>
            Don't have an account? <Link to="/register">Create One</Link>
          </p>
          <p style={{ textAlign: "center", marginTop: "1rem" }}>
            Forgot your password?{" "}
            <Link to="/password-reset">Reset Password</Link>
          </p>
        </form>
      </div>
      <div className="login-logo-container"></div>
    </section>
  );
}
