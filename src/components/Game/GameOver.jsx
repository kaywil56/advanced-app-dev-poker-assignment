/**
 * GameOver.jsx
 * Displays winner or winners if it is a draw
 */


import { useNavigate } from "react-router-dom";

const GameOver = ({ winners }) => {
  const navigate = useNavigate();
  return (
    <div>
      <h1>{winners.length > 1 ? "Draw" : "Winner"}</h1>
      <ul>
        {winners.map((winner, idx) => {
          return (
            <li key={`winner-idx-${idx}`}>
              {winner.email}: {winner.rank.type}
            </li>
          );
        })}
      </ul>
      <button onClick={() => navigate("/session")}>Home</button>
    </div>
  );
};

export default GameOver;
