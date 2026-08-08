import Navbar from "../components/Navbar";
import "../styles/CreateTiers.css";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import React from "react";
import { useNavigate } from "react-router-dom";
import { getRanks, saveTiers } from "../services/api";

export default function CreateTiers() {
  const location = useLocation();
  let { format } = location.state || "";
  let { tiersData } = location.state || [];
  let { playersToRemove } = location.state || [];

  const token = localStorage.getItem("access_token");

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState("");
  const [players, setPlayers] = useState([]);
  const [tiers, setTiers] = useState(tiersData);
  const [isSaved, setIsSaved] = useState(true);

  const initializedRef = useRef(false);

  function addTier() {
    let tierCount = 0;
    for (let i = 0; i < tiers.length; i++) {
      if (tiers[i].position == position) tierCount++;
    }
    let newTier = {
      id: tiers.length + 1,
      position: position,
      title: "Tier " + String(tierCount + 1),
      players: [],
    };
    setTiers([...tiers, newTier]);
  }

  const saveTiers = async (unsavedTiers, token, format, setIsSaved) => {
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
      setIsSaved(true);
    } catch (err) {
      console.error(err);
    }
  };

  const initializeData = async (e) => {
    setLoading(true);

    try {
      const res = await getRanks(format, "AVG");
      let availablePlayers = res.data.rankings.filter(
        (r) => !playersToRemove.includes(r.id),
      );
      setPlayers(availablePlayers);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleDragStart = (e, id, source) => {
    e.dataTransfer.setData("id", id);
    e.dataTransfer.setData("source", source);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const dropToLocation = (e, destination) => {
    e.preventDefault();

    const playerId = Number(e.dataTransfer.getData("id"));
    const source = Number(e.dataTransfer.getData("source"));

    e.dataTransfer.clearData();

    if (source == destination) return;

    // Copy current state
    let newAvailable = [...players];
    let newTiers = tiers.map((t) => ({ ...t, players: [...t.players] }));

    // Find the player object
    let player = null;

    // Remove player from source
    if (source === 0) {
      player = newAvailable.find((p) => p.id === playerId);
      newAvailable = newAvailable.filter((p) => p.id !== playerId);
    } else {
      const sourceTierIndex = source - 1;
      const sourceTier = newTiers[sourceTierIndex];
      player = sourceTier.players.find((p) => p.id === playerId);
      newTiers[sourceTierIndex] = {
        ...sourceTier,
        players: sourceTier.players.filter((p) => p.id !== playerId),
      };
    }

    if (!player) return; // safety guard

    // Add player to destination
    if (destination === 0) {
      newAvailable = [...newAvailable, player].sort((a, b) => a.rank - b.rank);
    } else {
      const destTierIndex = destination - 1;
      const destTier = newTiers[destTierIndex];
      newTiers[destTierIndex] = {
        ...destTier,
        players: [...destTier.players, player].sort((a, b) => a.rank - b.rank),
      };
    }

    // Update state immutably
    setIsSaved(false);
    setPlayers(newAvailable);
    setTiers(newTiers);
  };

  const handlePositionChange = async (e) => {
    let selectedPosition = e.target.value;
    setPosition(selectedPosition);
  };

  useEffect(() => {
    if (!initializedRef.current) {
      initializeData();
      initializedRef.current = true;
    }
    console.log("useEffect");
  }, []);

  return (
    <section className="create-tiers-page">
      <Navbar isSaved={false} tiers={tiers} format={format} />
      <div className="header-content">
        <div className="position-selector">
          <label htmlFor="position">Select Position:</label>
          <select
            name="position"
            id="position"
            value={position}
            onChange={handlePositionChange}
          >
            <option value="" disabled selected>
              -- Select an option --
            </option>
            <option value="QB">QB</option>
            <option value="RB">RB</option>
            <option value="WR">WR</option>
            <option value="TE">TE</option>
            <option value="DST">DST</option>
            <option value="K">K</option>
          </select>
        </div>
        <button
          className="save-tiers"
          onClick={() => saveTiers(tiers, token, format, setIsSaved)}
        >
          Save Tiers
        </button>
      </div>
      {position != "" && (
        <div className="content-container">
          <div className="tiers-data-container container">
            <div className="tiers-data">
              <h3>{position + " Tiers"}</h3>
              <div className="add-tier">
                <button onClick={addTier}>Add Tier</button>
              </div>
              <div className="tiers">
                {tiers.length > 0 &&
                  tiers.map(
                    (tier) =>
                      tier.position == position && (
                        <div className="tier">
                          <h5>{tier["title"]}</h5>
                          <div
                            className="tier-players-container"
                            onDragOver={handleDragOver}
                            onDrop={(e) => dropToLocation(e, tier.id)}
                          >
                            {tier.players.map((player) => (
                              <div
                                className="tiers-player"
                                key={player.id}
                                draggable
                                onDragStart={(e) =>
                                  handleDragStart(e, player.id, tier.id)
                                }
                              >
                                <p>
                                  {[
                                    "Rank: " + String(player.rank),
                                    player.name,
                                    player.team,
                                  ].join(" ")}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ),
                  )}
              </div>
            </div>
          </div>
          <div className="players-data">
            <h4>Players:</h4>
            <div
              className="tiers-players"
              onDragOver={handleDragOver}
              onDrop={(e) => dropToLocation(e, 0)}
            >
              {loading ? (
                <p className="load-rankings-create">Loading rankings...</p>
              ) : (
                players.map(
                  (player) =>
                    player.position == position && (
                      <div
                        className="tiers-player"
                        key={player.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, player.id, 0)}
                      >
                        <p>
                          {[
                            "Rank: " + String(player.rank),
                            player.name,
                            player.team,
                          ].join(" ")}
                        </p>
                      </div>
                    ),
                )
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
