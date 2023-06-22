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
  arrayUnion,
  arrayRemove,
  deleteDoc,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import firestore from "../firestore";

export const createGame = async (gameName, playerAmount, ownerId) => {
  const gameCollectionRef = collection(firestore, "games");
  const newGameDocRef = await addDoc(gameCollectionRef, {
    owner: ownerId,
    name: gameName,
    maxPlayers: playerAmount,
    started: false,
    joinedPlayers: [],
  });

  return newGameDocRef.id;
};

export const getGames = async (setGames) => {
  const gameCollectionRef = collection(firestore, "games");

  const gamesQuery = query(gameCollectionRef);

  const unsubscribe = onSnapshot(gamesQuery, async (querySnapshot) => {
    const games = [];
    querySnapshot.forEach(async (doc) => {
      games.push({
        id: doc.id,
        name: doc.data().name,
        started: doc.data().started,
        maxPlayers: doc.data().maxPlayers,
        owner: doc.data().owner,
        joinedPlayers: doc.data().joinedPlayers,
      });
    });
    setGames(games);
    console.log(games);
  });

  return () => unsubscribe();
};

export const joinGame = async (userId, gameId, isTurn, email) => {
  const playersDocRef = doc(firestore, "games", gameId, "players", userId);
  const gameDocRef = doc(firestore, "games", gameId);

  await updateDoc(gameDocRef, {
    joinedPlayers: arrayUnion(userId),
  });

  await setDoc(playersDocRef, {
    playerId: userId,
    isTurn: isTurn,
    discardPile: [],
    email: email,
  });
};

export const leaveGame = async (userId, gameId) => {
  const playersDocRef = doc(firestore, "games", gameId, "players", userId);
  const gameDocRef = doc(firestore, "games", gameId);

  await updateDoc(gameDocRef, {
    joinedPlayers: arrayRemove(userId),
  });

  await deleteDoc(playersDocRef);
};

export const startGame = async (gameId) => {
  const gameDocRef = doc(firestore, "games", gameId);

  await updateDoc(gameDocRef, {
    started: true,
  });
};

export const getPlayers = async (gameId, setPlayers, setHand, uid) => {
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
        email: doc.data().email,
        playerId: doc.data().playerId,
        hand: doc.data().hand,
        isTurn: doc.data().isTurn,
        rank: doc.data().rank,
        discardPile: doc.data().discardPile,
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

export const discardCards = async (gameId, playerId, discardedCards) => {
  const playerDocRef = doc(firestore, "games", gameId, "players", playerId);

  await updateDoc(playerDocRef, {
    discardPile: discardedCards,
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

  const shuffledDeck = shuffleDeck(deck);

  const playersQuery = collection(firestore, "games", gameId, "players");
  const playersSnapshot = await getDocs(playersQuery);

  playersSnapshot.forEach((doc) => {
    let hand = shuffledDeck.splice(0, 5);
    batch.update(doc.ref, { hand: hand });
  });

  await batch.commit();
};

function shuffleDeck(deck) {
  const shuffledDeck = [...deck];
  for (let i = shuffledDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
  }
  return shuffledDeck;
}

export const login = async (auth, email, password) => {
  await signInWithEmailAndPassword(auth, email, password);
};

export const register = async (auth, email, password) => {
  await createUserWithEmailAndPassword(auth, email, password);
};
