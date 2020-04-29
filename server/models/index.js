const chalk = require("chalk");
const Sequelize = require("sequelize");

console.log(chalk.yellow("Opening database connection"));

// create the database instance that can be used in other database files and specify the server route.
const db = new Sequelize("postgres://localhost:5432/kodonemu", {
  logging: false, // so we don't see all the SQL query made
});



// don't forget to run our models files and make all associations for our Sequelize objects (if you do it here consider circular references)

const Games = db.define("games", {
  cards: {
    type: Sequelize.ARRAY(Sequelize.JSON),
  },
  gameName: {
    type: Sequelize.STRING,
  },
  blueTurn: {
    type: Sequelize.BOOLEAN,
  },
  redCards: {
    type: Sequelize.INTEGER,
  },
  blueCards: {
    type: Sequelize.INTEGER,
  },
  winner: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  blueTeamFirst: {
    type: Sequelize.BOOLEAN,
  },
  //Postgres default createdAt column.
  // gameStartTime: {
  //   type: Sequelize.NOW,
  // },
    //Postgres default updatedAt column.
  // lastUpdated: {
  //   type: Sequelize.NOW,
  // }
});

module.exports = { db, Games };
