import "../styles/UserTiers.css";
import Navbar from "../components/Navbar";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import { applyPlugin } from "jspdf-autotable";
import { getRanks, getTiers } from "../services/api";

applyPlugin(jsPDF);

export default function UserTiers() {
  const [tiers, setTiers] = useState([]);
  const [printableTiers, setPrintableTiers] = useState({});
  const [tierCounts, setTierCounts] = useState({});
  const [format, setFormat] = useState("");
  const [playersToRemove, setPlayersToRemove] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedValue, setSelectedValue] = useState("");
  const [tierDict, setTierDict] = useState({});
  const [loadingDoc, setLoadingDoc] = useState(false);

  const initializedRef = useRef(false);

  const token = localStorage.getItem("access_token");

  const navigate = useNavigate();

  const warning = `Creating new tiers will delete your old tiers. If you have yet 
  to draft or still need to use the tiers you created, we suggest you wait to create 
  your new tiers.`;

  const generateTierColors = (numTiers) => {
    const colors = [];
    for (let i = 0; i < numTiers; i++) {
      const hue = (i / (numTiers - 1)) * 270; // red → violet
      const rgb = hslToRgb(hue, 0.9, 0.55); // convert HSL → RGB
      colors.push(`rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`);
    }
    return colors;
  };

  // Helper: convert HSL to RGB
  const hslToRgb = (h, s, l) => {
    h /= 360;
    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hueToRgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hueToRgb(p, q, h + 1 / 3);
      g = hueToRgb(p, q, h);
      b = hueToRgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  };

  const getUserTiers = async () => {
    const res = await getTiers();

    const players = res.data;
    const tierCounter = { QB: 0, RB: 0, WR: 0, TE: 0, DST: 0, K: 0 };
    const newPrintableTiers = {};
    const newTiers = [];
    const removeList = [];

    let currentTier = null;
    let currentPosition = null;
    let selectedFormat = players[0]?.format || "";
    let newTierDict = {};

    for (const player of players) {
      removeList.push(player.id);
      newTierDict[player.id] = player.tier;

      // Detect tier or position change
      const tierChanged = player.tier !== currentTier;
      const positionChanged = player.position !== currentPosition;

      if (tierChanged || positionChanged) {
        if (!newPrintableTiers[player.position]) {
          newPrintableTiers[player.position] = [];
        }

        newPrintableTiers[player.position].push([]);
        newTiers.push({
          id: newTiers.length + 1,
          position: player.position,
          title: `Tier ${player.tier}`,
          players: [],
        });

        currentTier = player.tier;
        currentPosition = player.position;
        tierCounter[player.position]++;
      }

      // Add player to current tier
      const currentTierIndex = newPrintableTiers[player.position].length - 1;
      newPrintableTiers[player.position][currentTierIndex].push(player.name);

      newTiers[newTiers.length - 1].players.push({
        id: player.id,
        name: player.name,
        team: player.team,
        position: player.position,
        rank: player.rank,
      });
    }

    setTierDict(newTierDict);
    setPrintableTiers(newPrintableTiers);
    setTiers(newTiers);
    setTierCounts(tierCounter);
    setFormat(selectedFormat);
    setPlayersToRemove(removeList);
  };

  const createTiers = (Tiers = [], PlayersToRemove = [], format) => {
    navigate("/create-tiers", {
      state: {
        format: format,
        tiersData: Tiers,
        playersToRemove: PlayersToRemove,
      },
    });
  };

  const getAvgRanks = async () => {
    try {
      const res = await getRanks(format, "AVG");
      let players = res.data.rankings;
      return players;
    } catch (err) {
      return [];
    }
  };

  const handleSubmit = () => {
    setShowForm(false);
    createTiers([], [], selectedValue);
  };

  const generateTierSheetDocument = async (tiersByPosition) => {
    setLoadingDoc(true);
    const POSITION_ORDER = ["QB", "RB", "WR", "TE", "DST", "K"];
    const tiersDoc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });

    //Set margins for page
    const margins = 20;

    // Generate ROYGBV gradient colors
    const tierCount = Math.max(...Object.values(tierCounts));
    const colors = generateTierColors(tierCount);
    //Set total Rows and columns per page
    let pageRows = 24;
    let pageColumns = 6;

    let rows = Array.from({ length: pageRows }, () => []);
    let cellColors = Array.from({ length: pageRows }, () => []);
    let head = [];
    let rowsIdx = 0;
    let columnIdx = 0;
    let playerCount;
    for (let i = 0; i < POSITION_ORDER.length; i++) {
      playerCount = 0;
      tiersByPosition[POSITION_ORDER[i]].map(
        (item) => (playerCount += item.length),
      );

      if (playerCount > (pageColumns - columnIdx) * 24) {
        while (columnIdx < 6) {
          head.push(" ");
          while (rowsIdx < 24) {
            rows[rowsIdx].push(" ");
            cellColors[rowsIdx].push([255, 255, 255]);
            rowsIdx++;
          }
          rowsIdx = 0;
          columnIdx++;
        }
        head.push("Tiers");
        for (let x = 0; x < colors.length; x++) {
          rows[rowsIdx].push("Tier " + String(x + 1));
          cellColors[rowsIdx].push(colors[x]);
          rowsIdx++;
        }

        while (rowsIdx < 24) {
          rows[rowsIdx].push("               ");
          cellColors[rowsIdx].push([255, 255, 255]);
          rowsIdx++;
        }
        tiersDoc.autoTable({
          head: [head],
          body: rows,
          margin: {
            top: margins,
            right: margins,
            bottom: margins,
            left: margins,
          },
          didParseCell: function (data) {
            if (data.section === "body") {
              const rowIndex = data.row.index;
              const colIndex = data.column.index;

              // Extract hex color from your map if it exists
              const targetColor = cellColors[rowIndex]?.[colIndex];

              if (targetColor) {
                data.cell.styles.fillColor = targetColor;
              }
              if (
                colors
                  .slice(-Math.floor(colors.length / 3))
                  .includes(targetColor)
              ) {
                data.cell.styles.textColor = [255, 255, 255];
              }
            }
          },
        });
        tiersDoc.addPage();
        rows = Array.from({ length: pageRows }, () => []);
        cellColors = Array.from({ length: pageRows }, () => []);
        head = [];
        rowsIdx = 0;
        columnIdx = 0;
      }

      head.push(POSITION_ORDER[i]);
      for (let j = 0; j < tiersByPosition[POSITION_ORDER[i]].length; j++) {
        for (let k = 0; k < tiersByPosition[POSITION_ORDER[i]][j].length; k++) {
          rows[rowsIdx].push(tiersByPosition[POSITION_ORDER[i]][j][k]);
          cellColors[rowsIdx].push(colors[j]);
          rowsIdx++;
          if (rowsIdx == 24) {
            rowsIdx = 0;
            columnIdx++;
            head.push(POSITION_ORDER[i]);
          }
        }
      }
      if (rowsIdx != 0) {
        while (rowsIdx < 24) {
          rows[rowsIdx].push("               ");
          cellColors[rowsIdx].push([255, 255, 255]);
          rowsIdx++;
        }
        rowsIdx = 0;
        columnIdx++;
      }
    }
    while (columnIdx < 6) {
      head.push("");
      while (rowsIdx < 24) {
        rows[rowsIdx].push("               ");
        cellColors[rowsIdx].push([255, 255, 255]);
        rowsIdx++;
      }
      rowsIdx = 0;
      columnIdx++;
    }
    head.push("Tiers");

    for (let x = 0; x < colors.length; x++) {
      rows[rowsIdx].push("Tier " + String(x + 1));
      cellColors[rowsIdx].push(colors[x]);
      rowsIdx++;
    }

    while (rowsIdx < 24) {
      rows[rowsIdx].push("               ");
      cellColors[rowsIdx].push([255, 255, 255]);
      rowsIdx++;
    }

    tiersDoc.autoTable({
      head: [head],
      body: rows,
      margin: {
        top: margins,
        right: margins,
        bottom: margins,
        left: margins,
      },
      didParseCell: function (data) {
        if (data.section === "body") {
          const rowIndex = data.row.index;
          const colIndex = data.column.index;

          // Extract hex color from your map if it exists
          const targetColor = cellColors[rowIndex]?.[colIndex];

          if (targetColor) {
            data.cell.styles.fillColor = targetColor;
          }
          if (
            colors.slice(-Math.floor(colors.length / 3)).includes(targetColor)
          ) {
            data.cell.styles.textColor = [255, 255, 255];
          }
        }
      },
    });

    // Save PDF
    tiersDoc.save("tier-sheet.pdf");
    setLoadingDoc(false);
  };

  useEffect(() => {
    if (!initializedRef.current) {
      getUserTiers();
      generateTierColors();
      initializedRef.current = true;
    }
  }, []);

  return (
    <section className="user-tiers-page">
      <Navbar />
      <div className="create-new-container">
        <button onClick={() => setShowForm(true)}>Create New Tiers</button>
      </div>
      <div className="container user-tiers-container">
        {tiers.length > 0 && (
          <div className="user-tiers">
            <div className="user-tiers-info">
              <h3>{format + " Tiers:"}</h3>
              <p>{"QB: " + tierCounts["QB"] + " tiers"}</p>
              <p>{"RB: " + tierCounts["RB"] + " tiers"}</p>
              <p>{"WR: " + tierCounts["WR"] + " tiers"}</p>
              <p>{"TE: " + tierCounts["TE"] + " tiers"}</p>
              <p>{"DST: " + tierCounts["DST"] + " tiers"}</p>
              <p>{"K: " + tierCounts["K"] + " tiers"}</p>
            </div>
            {!loadingDoc ? (
              <button onClick={() => generateTierSheetDocument(printableTiers)}>
                Export Document
              </button>
            ) : (
              <button>Loading...</button>
            )}
            <button onClick={() => createTiers(tiers, playersToRemove, format)}>
              Edit Tiers
            </button>
          </div>
        )}
      </div>
      {showForm && (
        <div className="container create-tiers-form-container">
          <div className="create-tiers-form">
            <p style={{ color: "red" }}>{warning}</p>
            <h2>Select Format:</h2>
            <select
              value={selectedValue}
              onChange={(e) => setSelectedValue(e.target.value)}
            >
              <option value="" disabled selected>
                -- Choose --
              </option>
              <option value="PPR">PPR</option>
              <option value="Half-PPR">Half-PPR</option>
              <option value="Standard">Standard</option>
            </select>

            <div className="create-tiers-form-buttons">
              <button className="submit-btn" onClick={handleSubmit}>
                Submit
              </button>
              <button className="cancel-btn" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
