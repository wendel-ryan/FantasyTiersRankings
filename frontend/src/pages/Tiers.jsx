import Navbar from "../components/Navbar";
import "../styles/Tiers.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function Tiers() {
  const navigate = useNavigate();

  const tierImportance = `Tier creation matters because it turns a messy draft board into a clear, strategic 
  roadmap. Fantasy football drafts move fast, and raw rankings alone don’t capture the real gaps in talent 
  or the moments where value drops off. Tiers group players by similar expected performance, helping you see 
  when a position is about to thin out, when you can safely wait, and when you should strike before a cliff 
  hits. They reduce panic picks, highlight pockets of value, and make your decisions resilient across 
  different league formats. Most importantly, tiers shift your mindset from “Who is ranked 27th vs. 32nd?” 
  to “Which group of players can help me win right now?”—a far more powerful way to draft.`;

  const ourTool = `This tool is designed to help fantasy football experts (like you) create positional 
  tiers that support smarter decision‑making on draft day. It gives you full creative freedom to build 
  fully customizable tiers for any draft format you’re preparing for. While positional tier creation works 
  for any league format because tiers are position‑specific, our rankings are intended for 1QB formats: 
  1 QB, 2 RB, 2 WR, 1 TE, 1 FLEX (RB/WR/TE), 1 DST, and 1 K. Although our positional rankings remain 
  viable across formats, if you plan to reference complete overall rankings, we recommend sourcing those 
  from rankings tailored to your league’s specific rules.`;

  const tierCreation = `To create tiers for any format, start by ranking players within each position, 
  identify natural performance drop‑offs, and cluster players who offer comparable upside, floor, and 
  role stability. Then adjust the size and number of tiers based on how heavily your league relies on 
  each position; formats with multiple starters at a position (like RB or WR) require wider, deeper 
  tiers, while single‑starter positions (like QB or TE) benefit from tighter, more defined tiers. 
  Leagues with more teams or deeper rosters naturally require more tiers because a larger player pool 
  will be drafted, and managers need clearer value distinctions at every pick. In a 12‑team league 
  compared to an 8‑team league, or in formats with expanded starting spots, tiers help identify where 
  talent drops off, where depth remains strong, and where hidden value can be found as the draft board 
  thins out. This approach ensures your tiers remain accurate and useful whether you’re drafting in 
  standard, half‑PPR, full‑PPR, superflex, tight‑end premium, or any custom league format.`;

  const example = `For example, in a 12‑team league with 1 QB, 2 RBs, 2 WRs, 1 TE, 1 FLEX (RB/WR/TE), 
  1 DST, 1 K, and 7 bench spots, the tier structure would look something like this:`;

  const tierComposition = `Higher‑quality tiers should always contain fewer players, because the top 
  talent pool is small and the differences between elite players are meaningful. As you move from the 
  upper tiers to the middle and lower tiers, each tier should gradually include more players, 
  reflecting the widening range of outcomes and the larger pool of mid‑level and bench‑level options. 
  Early tiers capture the most reliable, high‑upside players, so they stay tight and focused, while 
  later tiers expand to include deeper depth pieces, role players, and long‑shot upside picks. This 
  natural progression—small tiers at the top, larger tiers as you go down—helps drafters clearly see 
  where talent drops off, where depth remains strong, and where value can be found throughout the 
  draft.`;

  const sampleTiers = (
    <p>
      Quarterback (QB): 5-8 tiers
      <br />
      Running Back (RB): 10-12 tiers
      <br />
      Wide Receiver (WR): 10-12 tiers
      <br />
      Tight End (TE): 5-8 tiers
      <br />
      Defense/Special Teams (DST): 4-6 tiers
      <br />
      Kicker (K): 4-6 tiers
    </p>
  );

  const showTiers = () => {
    navigate("/create-tiers", {
      state: { format: "PPR" },
    });
  };

  return (
    <section className="tiers-page">
      <Navbar />
      <div className="container tiers-content-container">
        <div className="tiers-content">
          <h2>Tier Creation</h2>
          <p>{tierImportance}</p>
          <p>{ourTool}</p>
          <h3>How to Create Tiers:</h3>
          <p>{tierCreation}</p>
          <p>{example}</p>
          {sampleTiers}
          <p>{tierComposition}</p>
          <button className="create-tiers-link" onClick={showTiers}>
            Create/Edit Tiers
          </button>
        </div>
      </div>
    </section>
  );
}
