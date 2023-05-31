import {
  addDoc,
  collection,
  query,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  writeBatch,
  getDocs,
} from "firebase/firestore";
import firestore from "../firestore";

export const createGame = async (gameName, ownerId) => {
  const gameCollectionRef = collection(firestore, "games");
  const newGameDocRef = await addDoc(gameCollectionRef, {
    owner: ownerId,
    name: gameName,
    started: false,
  });

  return newGameDocRef.id;
};

export const getGames = (setGames) => {
  const gameCollectionRef = collection(firestore, "games");

  const gamesQuery = query(gameCollectionRef);

  const unsubscribe = onSnapshot(gamesQuery, async (querySnapshot) => {
    const games = [];
    querySnapshot.forEach((doc) => {
      games.push({
        id: doc.id,
        name: doc.data().name,
        started: doc.data().started,
        owner: doc.data().owner,
      });
    });
    setGames(games);
  });
  return () => unsubscribe();
};

export const joinGame = async (userId, gameId, isTurn) => {
  const playersDocRef = doc(firestore, "games", gameId, "players", userId);

  await setDoc(playersDocRef, {
    playerId: userId,
    isTurn: isTurn,
  });
};

export const startGame = async (gameId) => {
  const gameDocRef = doc(firestore, "games", gameId);

  await updateDoc(gameDocRef, {
    started: true,
  });
};

export const getPlayers = (gameId, setPlayers, setHand, uid) => {
  const playersCollectionRef = collection(
    firestore,
    "games",
    gameId,
    "players"
  );

  const playersQuery = query(playersCollectionRef);

  const unsubscribe = onSnapshot(playersQuery, (querySnapshot) => {
    const players = [];
    querySnapshot.forEach((doc) => {
      if (doc.data().playerId === uid) {
        setHand(doc.data().hand);
      }
      players.push({
        id: doc.id,
        playerId: doc.data().playerId,
        hand: doc.data().hand,
        isTurn: doc.data().isTurn,
      });
    });
    setPlayers(players);
  });

  return () => unsubscribe();
};

export const updateHand = async (gameId, playerId, hand) => {
  const playerDocRef = doc(firestore, "games", gameId, "players", playerId);

  await updateDoc(playerDocRef, {
    hand: hand,
  });
};

export const updateHandRank = async (gameId, playerId, handRank) => {
  const playerDocRef = doc(firestore, "games", gameId, "players", playerId);

  await updateDoc(playerDocRef, {
    rank: handRank,
  });
};

export const setNextPlayerTurn = async (gameId, playerId, nextPlayerId) => {
  const currentPlayerDocRef = doc(
    firestore,
    "games",
    gameId,
    "players",
    playerId
  );
  const nextPlayerDocRef = doc(
    firestore,
    "games",
    gameId,
    "players",
    nextPlayerId
  );

  await updateDoc(currentPlayerDocRef, {
    isTurn: false,
  });

  await updateDoc(nextPlayerDocRef, {
    isTurn: true,
  });
};

export const dealPlayersInitialCards = async (deck, gameId) => {
  const batch = writeBatch(firestore);

  const shuffledDeck = deck.sort(() => Math.random() - 0.5);

  const playersQuery = collection(firestore, "games", gameId, "players");
  const playersSnapshot = await getDocs(playersQuery);

  playersSnapshot.forEach((doc) => {
    let hand = shuffledDeck.splice(0, 5);
    batch.update(doc.ref, { hand: hand });
  });

  await batch.commit();
};
