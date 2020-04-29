const express = require("express");
// const app = express()
const router = express.Router();
const models = require("../models");
// const wordList = require("../models/cards");
const Games = models.Games;

//Get all games
router.get("/", async (req, res, next) => {
  try {
    let allGames = await Games.findAll();
    res.json(allGames);
    console.log("Get all games route");
  } catch (error) {
    res.status(500).send(error);
  }
});

//find a single game, if it doesnt exist... create a new one
router.post("/:gameName", async (req, res, next) => {
  try {
    const gameName = req.params.gameName
    let [game, created] = await Games.findOrCreate({
      where: {
        gameName: gameName,
      },
      defaults: newGame(gameName)
    })
    // if(created) {
    //   //create a new game and return it as response.
    //   res.json(newGame(gameName))
    // } else {
    //   //return the game that is found.
    //   res.json(game)
    // }
    res.json(game)
  } catch (error) {
    res.status(500).send(error);
  }
});






























//hlper func
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
  // cardSets = Array.from(new Set(cardSets));
  cardSets = Array.from(new Set(cardSets));

  // // Find out which sets are to be used (cardSets)
  // // Get all the cards and randomize the order
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

  // If word list is empty, default to vanilla set
  if (!words.length) {
    words.push(...wordList.vanilla);
  }

  // words = shuffle(words);

  let blueCards = 8;
  let redCards = 8;

  const blueGoesFirst = Math.floor(Math.random() * 2); // Binary RNG
  if (blueGoesFirst) {
    blueCards++;
  } else {
    redCards++;
  }

  let cards = [];
  // Fill with the first 25 cards
  for (let i = 0; i < 25; i++) {
    cards.push({
      value: words[i],
      team: "Neutral",
      clicked: false,
      teamClicked: null,
    });
  }

  // cards = assignTeamsToCards(cards, blueCards, redCards);

  const blueTurn = blueCards > redCards;

  console.log("--------------------------------inside new game function");

  return Object.assign({}, defaultGameState, {
    gameName,
    cards,
    blueCards,
    redCards,
    blueTurn,
    blueTeamFirst: blueCards > redCards,
  });
}




































//delete an existing game after createdAt time exceeds 24hrs.
router.delete("/:gameName", async (req, res, next) => {
  try {
    let deleteGame = await Games.findOne({
      where: {
        gameName: req.params.gameName,
      },
    });
    await deleteGame.destroy({ force: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

//update an existing game when users click new game in room.
router.put("/:gameName", async (req, res, next) => {
  try {
    let updateGame = await Games.findOne({
      where: {
        gameName: req.params.gameName,
      },
    });
    res.json(updateGame);
  } catch (error) {
    res.status(500).send(error);
  }
});

// update card state when it has been clicked.
router.post("/:gameName/cardClicked", async (req, res, next) => {
  try {
    let cardClicked = await Games.findOne({
      where: {
        gameName: req.params.gameName,
      },
    });
    res.status(200).send(cardClicked);
  } catch (error) {
    res.status(500).send(error);
  }
});

//update game state when players pass on a turn.
router.put("/:gameName/endTurn", async (req, res, next) => {
  try {
    let endTurn = await Games.findOne({
      where: {
        gameName: req.params.gameName,
      },
    });
    res.status(200).send(endTurn);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
