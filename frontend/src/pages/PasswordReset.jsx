import { useState } from "react";
import emailjs from "@emailjs/browser";
import { useNavigate } from "react-router-dom";
import "../styles/PasswordReset.css";
import Logo from "../assets/LogoWords.png";

export default function PasswordReset() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
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
    localStorage.setItem("reset_code", resetCode);
    localStorage.setItem("reset_email", email);

    const params = {
      email: email,
      code: resetCode,
    };

    try {
      await emailjs.send(
        "service_qosiy1j",
        "template_7b8nbxo",
        params,
        "lLCUJslWCVvn-dxCY",
      );

      setMessage("Reset code sent! Check your email.");
      navigate("/confirm-code");
    } catch (error) {
      console.error(error);
      setMessage("Failed to send reset code.");
    }
  };

  return (
    <section className="password-reset-page">
      <div className="register-logo-container">
        <img className="register-logo" src={Logo}></img>
      </div>
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
      <div className="register-logo-container"></div>
    </section>
  );
}
