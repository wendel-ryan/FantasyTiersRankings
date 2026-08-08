import Navbar from "../components/Navbar";
import { useState, React } from "react";
import GenericHeadshot from "../assets/generic-headshot.png";
import "../styles/Rankings.css";
import { getRanks, getTiers } from "../services/api";
import jsPDF from "jspdf";
import { applyPlugin } from "jspdf-autotable";

export default function Rankings() {
  const [rankings, setRankings] = useState([]);
  const [format, setFormat] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDoc, setLoadingDoc] = useState(false);

  const token = localStorage.getItem("access_token");

  const leagueFormat = `These rankings are built for 1QB leagues (1 QB, 2 RB, 2 WR, 1 TE, 1
    FLEX, 1 DST, 1 K).`;
  const informational = `Positional tiers are format‑agnostic and can be used in any league type. 
    However, users relying on complete overall rankings for tier creation should incorporate 
    external rankings that match their league’s specific settings.`;

  const handleFormatChange = async (e) => {
    let selectedFormat = e.target.value;
    setFormat(selectedFormat);

    if (!selectedFormat) return;

    setLoading(true);

    try {
      const res = await getRanks(selectedFormat, "AVG");
      let posrank = { QB: 1, WR: 1, TE: 1, RB: 1, DST: 1, K: 1 };
      let rankings = res.data.rankings;
      for (let i = 0; i < rankings.length; i++) {
        rankings[i]["posrank"] =
          rankings[i]["position"] + String(posrank[rankings[i]["position"]]);
        posrank[rankings[i]["position"]]++;
      }
      setRankings(rankings);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

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

  const generateRankingsDoc = async () => {
    const res = await getTiers();
    const tiersData = res.data;

    let tierDict = {};
    if (tiersData[0].format == format) {
      for (let i = 0; i < tiersData.length; i++) {
        tierDict[tiersData[i].id] = tiersData[i].tier;
      }
    }
    const tierCount = Math.max(...Object.values(tierDict));
    const colors = generateTierColors(tierCount);

    const ranksDoc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const margins = 20;
    const pageRows = 35;
    const pageColumns = 3;

    let rowsIdx = 0;
    let columnIdx = 0;
    let rows = Array.from({ length: pageRows }, () => []);
    let cellColors = Array.from({ length: pageRows }, () => []);
    for (let i = 0; i < rankings.length; i++) {
      rows[rowsIdx].push(
        String(rankings[i].rank) +
          ". " +
          rankings[i].name +
          " (" +
          rankings[i].team +
          ")",
      );
      if (tierDict[rankings[i].id] != undefined) {
        cellColors[rowsIdx].push(colors[tierDict[rankings[i].id] - 1]);
      } else {
        cellColors[rowsIdx].push("rgb(255,255,255)");
      }
      rowsIdx++;
      if (rowsIdx == pageRows) {
        rowsIdx = 0;
        columnIdx++;
      }
      if (columnIdx == pageColumns) {
        if (Object.values(tierDict).length > 0) {
          ranksDoc.autoTable({
            body: rows,
            margins: {
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
        } else {
          ranksDoc.autoTable({
            body: rows,
            margins: {
              top: margins,
              right: margins,
              bottom: margins,
              left: margins,
            },
          });
        }
        ranksDoc.addPage();

        rows = Array.from({ length: pageRows }, () => []);
        cellColors = Array.from({ length: pageRows }, () => []);
        columnIdx = 0;
      }
    }
    while (columnIdx < pageColumns) {
      while (rowsIdx < pageRows) {
        rows[rowsIdx].push("                         ");
        cellColors[rowsIdx].push("rgb(255,255,255)");
        rowsIdx++;
      }
      rowsIdx = 0;
      columnIdx++;
    }

    if (Object.values(tierDict).length > 0) {
      ranksDoc.autoTable({
        body: rows,
        margins: {
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
    } else {
      ranksDoc.autoTable({
        body: rows,
        margins: {
          top: margins,
          right: margins,
          bottom: margins,
          left: margins,
        },
      });
    }

    ranksDoc.save("rankings.pdf");
  };

  return (
    <section className="rankings-page">
      <Navbar />
      <div className="rankings-disclaimer">
        <h5>{leagueFormat}</h5>
        <p>{informational}</p>
      </div>
      <div className="rankings-selector-div">
        <div>
          <label htmlFor="format">Select Format:</label>
          <select
            name="format"
            id="format"
            value={format}
            onChange={handleFormatChange}
          >
            <option value="" disabled selected>
              -- Select an option --
            </option>
            <option value="PPR">PPR</option>
            <option value="Half-PPR">Half-PPR</option>
            <option value="Standard">Standard</option>
          </select>
        </div>
        {format.length > 0 &&
          (!loadingDoc ? (
            <button onClick={() => generateRankingsDoc()}>
              Export Rankings
            </button>
          ) : (
            <button>Loading...</button>
          ))}
      </div>

      {loading && <p className="load-rankings">Loading rankings...</p>}

      {!loading && rankings.length > 0 && (
        <div className="container rankings-table-container">
          <table className="rankings-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th></th>
                <th>Player</th>
                <th>Team</th>
                <th>Position</th>
                <th>Positional Rank</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((r) => (
                <tr key={r.player_id}>
                  <td>{r.rank}</td>
                  <td>
                    {!r.image ? (
                      <img src={GenericHeadshot} />
                    ) : (
                      <img src={r.image} />
                    )}
                  </td>
                  <td>{r.name}</td>
                  <td>{r.team}</td>
                  <td>{r.position}</td>
                  <td>{r.posrank}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
