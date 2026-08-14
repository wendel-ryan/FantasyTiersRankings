import { Link } from "react-router-dom";
import Logo from "../assets/Logo.png";
import "../styles/Navbar.css";
import { useNavigate } from "react-router-dom";
import { saveTiers } from "../services/api";

export default function Navbar({
  isSaved = null,
  tiers = null,
  format = null,
}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token"); // remove JWT
    navigate("/login"); // redirect to login
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleClick = async (e, destination) => {
    e.preventDefault();
    if (isSaved != null && !isSaved) {
      await saveUserTiers(tiers);
      navigate(destination);
    }
    navigate(destination);
  };

  const saveUserTiers = async (unsavedTiers) => {
    let tiersToSave = [];
    for (let i = 0; i < unsavedTiers.length; i++) {
      for (let j = 0; j < unsavedTiers[i].players.length; j++) {
        tiersToSave.push({
          player_id: unsavedTiers[i].players[j].id,
          position: unsavedTiers[i].position,
          format: format,
          tier: Number(unsavedTiers[i].title.split(" ")[1]),
        });
      }
    }

    try {
      const res = await saveTiers(tiersToSave);
    } catch (err) {
      console.error(err);
    }
  };

  const token = localStorage.getItem("access_token");

  return (
    <nav className="navbar">
      <div className="navbar-even">
        <img className="nav-logo" src={Logo} />
      </div>
      <ul className="nav-items">
        <li className="nav-item">
          <Link to="/rankings" onClick={(e) => handleClick(e, "/rankings")}>
            Rankings
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/home" onClick={(e) => handleClick(e, "/")}>
            Home
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/user-tiers" onClick={(e) => handleClick(e, "/user-tiers")}>
            Tiers
          </Link>
        </li>
      </ul>
      <div className="navbar-even">
        {!token ? (
          <button className="logout" onClick={handleLogin}>
            Login
          </button>
        ) : (
          <button className="logout" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
