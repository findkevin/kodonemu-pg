const express = require("express");
const router = express.Router();
const models = require("../models");
const Games = models.Games;

const io = require('socket.io')();
require('../socket/sockets')

router.get("/", async (req, res, next) => {
  try {
    let allGames = await Games.findAll();
    res.json(allGames);
    console.log("Get all existing games!");
  } catch (error) {
    next(error);
  }
});

router.get("/:gameName", async (req, res, next) => {
  try {
    const gameName = req.params.gameName
    let [game, created] = await Games.findOrCreate({
      where: {
        gameName: gameName,
      },
      defaults: newGame(gameName)
    })
    created ? console.log('Created new game because we could not find an existing game.') : console.log('Found existing game!')
    res.json(game)
  } catch (error) {
    next(error);
  }
});

router.put("/:gameName/newGame", async (req, res, next) => {
  try {
    const gameName = req.params.gameName
    const [numAffectedRows, [updateGame]] = await Games.update(
      newGame(gameName),
      {
        where: {
          gameName: gameName,
        },
        returning: true
      }
    )
    console.log('Game has been updated!')
    io.to(gameName).emit("updateGame", updateGame);
    res.status(200).json(updateGame)
  } catch (error) {
    next(error)
  }
})


router.put('/:gameName/cardClicked', async (req, res, next) => {
  try {
    const gameName = req.params.gameName;
    const cardIndex = req.body.cardIndex;
    const teamClicked = req.body.teamClicked;
    const currentGame = await Games.findOne({
      where: {
        gameName: gameName,
      }
    })

    //Make a copy all cards from current game.
    let cardsArray = [...currentGame.cards]
    let selectedCard;
    let blueTurn = currentGame.blueTurn;
    let redCards = currentGame.redCards;
    let blueCards = currentGame.blueCards;
    let winner = currentGame.winner;

    if(!(currentGame.winner || cardsArray[cardIndex].clicked)){
      //Get the single card from our copy and change its values for clicked and which team clicked the card.
      selectedCard = {...cardsArray[cardIndex], clicked: true, teamClicked}

      const cardsRemaining = calculateCardsRemaining(currentGame.cards)

      redCards = cardsRemaining.redTeam;
      blueCards = cardsRemaining.blueTeam;


      // End turn if not the team's card
      if (
        (currentGame.blueTurn && cardsArray[cardIndex].team !== "Blue") ||
        (!currentGame.blueTurn && cardsArray[cardIndex].team !== "Red")
        ) {
          blueTurn = !currentGame.blueTurn;
        }
        //Return the array with new card values.
      cardsArray[cardIndex] = selectedCard
      winner = determineWinner(cardsArray)
    }

    //Update the database with the new copy of the cards array.
    const [numAffectedRows, [updateGame]] = await Games.update(
      {...currentGame, cards: cardsArray, blueTurn, redCards, blueCards, winner},
      {
        where: {
          gameName: gameName,
        },
        returning: true
      }
    )
    console.log('A card has been flipped!')
    io.to(gameName).emit("updateGame", updateGame);
    res.status(200).json(updateGame);
  } catch (error) {
    next(error)
  }
})

router.put("/:gameName/endTurn", async (req, res, next) => {
  try {
    const gameName = req.params.gameName
    const currentGame = await Games.findOne({
      where: {
        gameName: gameName,
      }
    })

    const blueTurn = currentGame.blueTurn;

    const [numAffectedRows, [updateGame]] = await Games.update(
      {blueTurn: !blueTurn},
      {
        where: {
          gameName: gameName,
        },
        returning: true
      }
      )
      io.to(gameName).emit("updateGame", updateGame);
      res.status(200).json(updateGame)
  } catch (error) {
    next(error)
  }
})

//HELPER FUNCTIONS--------------------------------------------------------
const defaultGameState = {
  cards: [],
  gameName: null,
  blueTurn: false,
  redCards: 0,
  blueCards: 0,
  winner: null,
  blueTeamFirst: false,
};

const wordList = require("../models/cards");

function newGame(gameName, cardSets = ["VANILLA"]) {
  cardSets = Array.from(new Set(cardSets));

  // Find out which sets are to be used (cardSets)
  let words = [];

  for (let i = 0; i < cardSets.length; i++) {
    switch (cardSets[i]) {
      case "VANILLA": {
        words.push(...wordList.vanilla);
        break;
      }
      default: {
        break;
      }
    }
  }

  if (!words.length) {
    words.push(...wordList.vanilla);
  }

  words = shuffle(words);

  let blueCards = 8;
  let redCards = 8;

  //Determine which team goes first.
  //Starting team will have one extra card as per game rules.
  const blueGoesFirst = Math.floor(Math.random() * 2);
  if (blueGoesFirst) {
    blueCards++;
  } else {
    redCards++;
  }

  let cards = [];
  // Fill the array with the first 25 cards
  for (let i = 0; i < 25; i++) {
    cards.push({
      value: words[i],
      team: "Neutral",
      clicked: false,
      teamClicked: null,
    });
  }

  // Assign the cards to the Spymaster grid view.
  cards = assignTeamsToCards(cards, blueCards, redCards);

  const blueTurn = blueCards > redCards;

  return Object.assign({}, defaultGameState, {
    gameName,
    cards,
    blueCards,
    redCards,
    blueTurn,
    blueTeamFirst: blueCards > redCards,
  });
}

// Randomly shuffles an array
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }

  return array;
}

// Set cards to be red/blue/assassin
function assignTeamsToCards(cards, blueCards, redCards) {
  // Blue cards at start of deck
  for (let i = 0; i < blueCards; i++) {
    cards[i].team = "Blue";
  }

  // Red cards after blue cards
  for (let i = blueCards; i < blueCards + redCards; i++) {
    cards[i].team = "Red";
  }

  // Assassin after the other cards
  cards[17].team = "Assassin";

  return shuffle(cards);
}

function calculateCardsRemaining(cards) {
  const cardCount = {
    blueTeam: 0,
    redTeam: 0,
  };

  if (cards.length) {
    const blueCardsRemaining = cards.filter(
      (card) => card.team === "Blue" && !card.clicked
    );
    cardCount.blueTeam = blueCardsRemaining.length;

    const redCardsRemaining = cards.filter(
      (card) => card.team === "Red" && !card.clicked
    );
    cardCount.redTeam = redCardsRemaining.length;
  }

  return cardCount;
}

function determineWinner(cards) {
  if (cards.length) {
    const assassinCard = cards.find(
      (card) => card.team === "Assassin" && card.clicked
    );

    if (assassinCard) {
      if (assassinCard.teamClicked === "Red") {
        return "Blue";
      } else {
        return "Red";
      }
    }

    const cardsRemaining = calculateCardsRemaining(cards);

    if (cardsRemaining.blueTeam === 0) {
      return "Blue";
    }

    if (cardsRemaining.redTeam === 0) {
      return "Red";
    }
  }

  return null;
}


module.exports = router;
