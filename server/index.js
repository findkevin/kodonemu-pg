//PostgreSQL Sequelize Postico Database\\
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const chalk = require("chalk");
const models = require("./models");
const apiRoutes = express.Router();

const socket = require('socket.io')

 //-----------------------------------------------------------------------

models.db.authenticate().then(() => {
  console.log("Connected to the PostGres database");
});

const PORT = process.env.PORT || 5000;

const init = async () => {
  await
  // models.db.sync() // Pass in {force: true} to drop all tables then recreates them based on our JS definitions
  models.db.sync({force: true});
};

init()

const server = app.listen(PORT, () => {
  console.log(chalk.yellow(`Codenames server is listening on port ${PORT}!`));
});

const io = socket(server)

io.on('connection', socket => {
  console.log(`A socket connection to the server has been made: ${socket.id}`)
  socket.on('joinRoom', (roomName) => {
      socket.join(roomName);
      console.log('Someone joined the game.')
  })

  socket.on('disconnect', () => {
    console.log(`Connection ${socket.id} has left the building`)
  });
})

//------------------------------------------------------------------------

// Body Parser allows reading of JSON from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use("/api", apiRoutes);

apiRoutes.use('/games', require('./routes/gamesRoutes'));

// app.get('/', function (req, res, next) {
//   res.redirect('/');
// });

app.use((req, res, next) => {
  res.status(404).send("404 Not found");
});

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send(`
  <h1>Yay our 500 Server error is: ${err}</h1>
`)
})



//Express Router--------------------------END-----------------------------


//^PostgreSQL Sequelize Postico Database^\\

module.exports = app;
