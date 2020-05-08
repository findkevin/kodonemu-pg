//PostgreSQL Sequelize Postico Database\\
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const chalk = require("chalk");
const models = require("./models");
const apiRoutes = express.Router();
const path = require('path')

 //-----------------------------------------------------------------------
const PORT = process.env.PORT || 5000;
const server = require('http').createServer(app)
const io = require('socket.io')(server);

require('./socket/sockets')(io);

models.db.authenticate().then(() => {
  console.log(chalk.yellow("Connected to the PostGres database"));
});

const init = async () => {
  await
  models.db.sync() // Pass in {force: true} to drop all tables then recreates them based on our JS definitions
  // models.db.sync({force: true});
};

init()

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

app.use(express.static(path.join(__dirname, 'public')));

app.use("/api", apiRoutes);

apiRoutes.use('/games', require('./routes/gamesRoutes'));

// app.get('/', function (req, res, next) {
//   res.sendFile(__dirname + '/index.html');
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

server.listen(PORT, function(){
  console.log(`App is now listening on PORT ${PORT}`)
})

module.exports = app;
