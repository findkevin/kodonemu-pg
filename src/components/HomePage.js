import React, { Component } from "react";
import history from "../history/index";

import CodeNames from "../images/CodeNames.png";
import GitHubMark from "../images/GitHub-Mark-32px.png";

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.startGame = this.startGame.bind(this);
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img className="App-logo" src={CodeNames} alt="CodeNames Logo"></img>

          <hr />
          <div id="input-field">
            <p>To join a game, enter the room name and click 'Enter.'</p>
            <input
              type="text"
              onInput={this.sanitizeGameName}
              id="game-name"
              onKeyPress={this.handleKeyPress}
            />
            <button onClick={this.startGame}>Enter</button>
          </div>
        </header>

        <footer>
          <span>Unofficial web version of Codenames created by Kevin Lam </span>

          <a
            className="App-link"
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/findkevin/codenames"
          >
            <img
              className="GitHub-logo"
              src={GitHubMark}
              alt="GitHub Mark"
            ></img>
          </a>
        </footer>
      </div>
    );
  }

  //Helper Functions
  //Create a function to get the string value of the game name from the URI.
  startGame = () => {
    let gameName = document
      .getElementById("game-name")
      .value.replace(/-+$/, "");

    // Remove trailing slashes
    gameName = gameName.replace(/-+$/, "");

    history.push("/" + gameName);
  };

  sanitizeGameName = (event) => {
    let gameName = document.getElementById("game-name").value;
    gameName = gameName.replace(" ", "-");
    gameName = gameName.replace("/", "-");
    gameName = gameName.replace(";", "-");
    gameName = gameName.replace(":", "-");
    gameName = gameName.toLowerCase();
    document.getElementById("game-name").value = gameName;
  };

  //Create a fn to listen for an event. If the event is ENTER, start the game.
  handleKeyPress = (event) => {
    if (event.key === "Enter") {
      this.startGame();
    }
  };
}

export default HomePage;
