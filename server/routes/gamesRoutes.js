const express = require("express");
const app = express()
const router = express.Router();
const models = require("../models");
// const wordList = require("../models/cards");
const Games = models.Games;











//SOCKETS----------------------------------------
//   const PORT = 5000;

//   //Initialize our server port to localhost:5000
//   const server = app.listen(PORT, "localhost", () =>
//   console.log(`Codenames server listening on port ${PORT}`)
//   );


// const socket = require("socket.io");

// const io = socket(server);

// io.on("connection", (socket) => {
//   socket.on("joinRoom", (roomName) => {
//     socket.join(roomName);
//   });

//   socket.on("disconnect", () => {});
// });

//SOCKETS----------------------------------------






















//Get all games in the database
router.get("/", async (req, res, next) => {
  try {
    let allGames = await Games.findAll();
    res.json(allGames);
    console.log("Get all existing games!");
  } catch (error) {
    next(error);
  }
});

//Find a single game, if it doesnt exist... create a new one
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
    // io.to(gameName).emit("getGame", game)
    res.json(game)
  } catch (error) {
    next(error);
  }
});


//update an existing game with new game state.
//search db, find game by name, give game new state, keep the game name.
router.put("/:gameName/newGame", async (req, res, next) => {
  try {
    const gameName = req.params.gameName
    const [numAffectedRows, [updatedGame]] = await Games.update(
      newGame(gameName),
      {
        where: {
          gameName: gameName,
        },
        returning: true
      }
    )
    console.log('Game has been updated!')
      // io.to(gameName).emit("updatedGame", updatedGame);
    res.status(200).json(updatedGame)
  } catch (error) {
    next(error)
  }
})

//find the existing game, check card value if it has been clicked.
//dont click the card if already clicked or game is over
//end turn if its not the teams card.
router.put('/:gameName/cardClicked', async (req, res, next) => {
  try {
    const gameName = req.params.gameName;
    const cardIndex = 1 //req.body.cardIndex;
    const teamClicked = 'Black' //req.body.teamClicked;
    const currentGame = await Games.findOne({
      where: {
        gameName: gameName,
      }
    })

    //Make a copy all cards from current game.
    let cardsArray = [...currentGame.cards]
    //Get the single card from our copy and change its values
    let selectedCard = {...cardsArray[cardIndex], clicked: true, teamClicked}
    //Return the array with new card values.
    cardsArray[cardIndex] = selectedCard

    //Update the database with the new copy of the cards array.
    const [numAffectedRows, [updatedGame]] = await Games.update(
      {cards: cardsArray},
      {
        where: {
          gameName: gameName,
        },
        returning: true
      }
    )
        // io.to(gameName).emit("updatedGame", updatedGame);
    res.status(200).json(updatedGame);
  } catch (error) {
    next(error)
  }
})

//The array is saved inside a cell and cannot access individual card object values.
//Try to spread the array into an object,
//change the desired card value.
//Then spread the object inside a new array
//and send it back to the database as an array.
// const cardData = {...[cards]} '=> MODIFY DATA =>' [...{newCards}]

//^^Able to grab single card from game. Still have to implement update.



//End teams turn
//find the game, flip team turn.
//update game
router.put("/:gameName/endTurn", async (req, res, next) => {
  try {
    const gameName = req.params.gameName
    const currentGame = await Games.findOne({
      where: {
        gameName: gameName,
      }
    })

    const blueTurn = currentGame.blueTurn;

    const [numAffectedRows, [updatedGame]] = await Games.update(
      {blueTurn: !blueTurn},
      {
        where: {
          gameName: gameName,
        },
        returning: true
      }
      )
      // io.to(gameName).emit("updatedGame", updatedGame);
    res.status(200).json(updatedGame)
  } catch (error) {
    next(error)
  }
})
























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

  // If word list is empty, default to vanilla set
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

  console.log('---------------------------------------Inside new game function')

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

  console.log('---------------------------------------------Shuffling cards...')

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

  console.log('----------------------------------------Assigned teams to cards')

  return shuffle(cards);
}

































// //delete an existing game after createdAt time exceeds 24hrs.
// router.delete("/:gameName", async (req, res, next) => {
//   try {
//     let deleteGame = await Games.findOne({
//       where: {
//         gameName: req.params.gameName,
//       },
//     });
//     await deleteGame.destroy({ force: true });
//   } catch (error) {
//     res.status(500).send(error);
//   }
// });

module.exports = router;
