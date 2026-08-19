import { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import { useNavigate } from "react-router-dom";
import "../styles/EmailConfirm.css";
import Logo from "../assets/LogoWords.png";
import { Link } from "react-router-dom";

export default function EmailConfirm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sentCode, setSentCode] = useState(false);
  const [codeInput, setCodeInput] = useState("");

  const navigate = useNavigate();

  const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendResetCode = async () => {
    if (!email) {
      setMessage("Please enter your email.");
      return;
    }

    const resetCode = generateCode();
    localStorage.setItem("reset_email", email);

    const params = {
      email: email,
      code: resetCode,
    };

    try {
      await emailjs.send(
        "service_c39t6it",
        "template_944u80f",
        params,
        "_gRFHqHLO77_tO_uO",
      );

      setMessage("Reset code sent! Check your email.");
      setSentCode(true);
      localStorage.setItem("reset_code", resetCode);
    } catch (error) {
      console.error(error);
      setMessage("Failed to send reset code.");
    }
  };

  const handleConfirm = () => {
    const storedCode = localStorage.getItem("reset_code");
    if (codeInput === storedCode) {
      setMessage("Code verified!");
      localStorage.removeItem("reset_code");
      navigate("/new-password");
    } else {
      setMessage("Invalid code. Try again.");
    }
  };

  return (
    <section className="password-reset-page">
      <div className="register-logo-container">
        <img className="register-logo" src={Logo}></img>
      </div>
      {localStorage.getItem("reset_email") ? (
        <div className="container confirm-container">
          <div className="confirm-form">
            <h2>Enter Reset Code</h2>
            <p>A password reset code has been sent to {email}</p>
            <input
              type="text"
              placeholder="6-digit code"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
            />

            <button onClick={handleConfirm}>Confirm Code</button>
            <Link className="resend" onClick={sendResetCode}>
              Resend Code
            </Link>
            {message && <p>{message}</p>}
          </div>
        </div>
      ) : (
        <div className="container password-reset-container">
          <div className="password-reset-form">
            <h2>Password Reset</h2>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button onClick={sendResetCode}>Send Reset Code</button>

            {message && <p>{message}</p>}
          </div>
        </div>
      )}
      <div className="register-logo-container"></div>
    </section>
  );
}
