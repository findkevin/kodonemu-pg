//PostgreSQL Sequelize Postico Database\\
const express = require("express");
const app = express();
const chalk = require("chalk");
const models = require("./models");
const path = require("path");
const apiRoutes = express.Router();



app.use(express.static(path.join(__dirname, "./public"))); //serving up static files (e.g. css files)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/api", apiRoutes);
// apiRoutes.use('/cards', require('./routes/cards'));
apiRoutes.use('/games', require('./routes/gamesRoutes'));

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

module.exports = app;

//Express Router--------------------------END-----------------------------

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

init();


//^PostgreSQL Sequelize Postico Database^\\
