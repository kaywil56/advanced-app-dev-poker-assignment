import { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../AuthContext";

const Game = () => {
  const HAND_LENGTH = 5;

  const { authContext } = useContext(AuthContext)
  const [hand, setHand] = useState(initializeDeck());

  function initializeDeck() {
    const suits = ["Spades", "Hearts", "Diamonds", "Clubs"];
    const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

    const deck = [];

    for (let i = 0; i < HAND_LENGTH; i++) {
      deck.push({
        suit: suits[Math.floor(Math.random() * suits.length)],
        value: values[Math.floor(Math.random() * values.length)],
      });
    }

    return deck;
  }
  
  // Protect route
  if (!authContext.uid) {
    return <Navigate to="/" />;
  }

  return (
    <div>
      {hand.map((card, idx) => {
        return (
          <span style={{ margin: "10px" }} key={`card-${idx}`}>{`${card.value} of ${card.suit}`}</span>
        );
      })}
    </div>
  );
};

export default Game;
