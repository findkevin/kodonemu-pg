//PostgreSQL Sequelize Postico Database\\
const express = require("express");
const app = express();
const chalk = require("chalk");
const models = require("./models");
const path = require("path");
const apiRoutes = express.Router();
const socket = require('socket.io')
const request = require('request');



app.use(express.static(path.join(__dirname, "./public"))); //serving up static files (e.g. css files)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//CORS ERROR FIX?
//LEARN: https://medium.com/@dtkatz/3-ways-to-fix-the-cors-error-and-how-access-control-allow-origin-works-d97d55946d9
//IMPLEMENTED THIS SOLUTION: https://stackoverflow.com/questions/51231699/access-control-allow-origin-header-in-the-response-must-not-be-the-wildcard

app.use( (req, res, next) => {
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept"
  );
  if ("OPTIONS" === req.method) {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use("/api", apiRoutes);
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

app.get('/', function (req, res, next) {
  res.redirect('/');
  request(
    { url: 'http://localhost:5000/'},
    (error, response, body) => {
      if(error || response.statusCode !== 200) {
        return res.status(500).json({type: 'error', message: error.message})
      }
      res.json(JSON.parse(body));
    }
  )
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
