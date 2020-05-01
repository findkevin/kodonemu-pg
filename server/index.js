//PostgreSQL Sequelize Postico Database\\
const express = require("express");
const app = express();
const chalk = require("chalk");
const models = require("./models");
const path = require("path");
const apiRoutes = express.Router();
const socket = require('socket.io')



app.use(express.static(path.join(__dirname, "./public"))); //serving up static files (e.g. css files)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//CORS ERROR FIX? https://medium.com/@dtkatz/3-ways-to-fix-the-cors-error-and-how-access-control-allow-origin-works-d97d55946d9
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.use("/api", apiRoutes);
// apiRoutes.use('/cards', require('./routes/cards'));
apiRoutes.use('/games', require('./routes/gamesRoutes'));

 //-----------------------------------------------------------------------
models.db.authenticate().then(() => {
  console.log("Connected to the PostGres database");
});

const PORT = 5000

const init = async () => {
  await
  // models.db.sync();
  // this drops all tables then recreates them based on our JS definitions
  models.db.sync({force: true});
  app.listen(PORT, () => {
    console.log(chalk.yellow(`Server is listening on port ${PORT}!`));
  });
};

const io = socket(init());

io.on('connection', socket => {
  socket.on('joinRoom', (roomName) => {
    socket.join(roomName);
  })

  socket.on('disconnect', () => {});
})

//------------------------------------------------------------------------

app.get('/', function (req, res) {
  res.redirect('/');
});

app.use((req, res, next) => {
  res.status(404).send("404 Not found");
  // res.status(404).send(notFound());
  // next(); //should we be calling next here? would every 404 go to our next middleware (500)?
});

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send(`
  <h1>Yay our 500 Server error is: ${err}</h1>
`)
  // res.status(500).render('this is our custom error message', {error: err})
})



//Express Router--------------------------END-----------------------------


//^PostgreSQL Sequelize Postico Database^\\

module.exports = app;
