import { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import LoginRegister from "./routes/LoginRegister";
import Session from "./routes/Session";
import Game from "./routes/Game";
import WaitingRoom from "./routes/WaitingRoom";
import AuthContext from "./AuthContext";
import GameContext from "./GameContext";

const App = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [authContext, setAuthContext] = useState({});
  const [currentGameContext, setCurrentGameContext] = useState({});

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthContext({ uid: user.uid, email: user.email, currentGame: {} });
        navigate("/session");
      } else {
        setAuthContext({});
      }
    });
  }, []);

  return (
    <AuthContext.Provider value={{ authContext, setAuthContext }}>
      <GameContext.Provider value={{ currentGameContext, setCurrentGameContext }}>
        <Routes>
          <Route path="/" element={<LoginRegister text={"login"} />} />
          <Route
            path="/register"
            element={<LoginRegister text={"Register"} />}
          />
          <Route path="/session" element={<Session />} />
          <Route path="/waiting" element={<WaitingRoom />} />
          <Route path="/game" element={<Game />} />
        </Routes>
      </GameContext.Provider>
    </AuthContext.Provider>
  );
};

export default App;
