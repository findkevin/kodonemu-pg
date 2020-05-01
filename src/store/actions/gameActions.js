import axios from 'axios';
import { serverUrl } from '../../config/serverUrl';

axios.defaults.baseURL = serverUrl;

export function loadGame(gameName)
{
  return {
    type: 'LOAD_GAME',
    payload: axios.post(gameName)
  };
}

export function updateGame(game)
{
  return {
    type: 'UPDATE_GAME',
    payload: game
  };
}

export function startNewGame(gameName)
{
  axios.put(gameName + '/newGame', {
    gameName
  });
}

export function endTurn(gameName)
{
  axios.put(gameName + '/endTurn');
}

export function cardClick(gameName, cardIndex, teamClicked)
{
  axios.put(gameName + '/cardClicked', {
    cardIndex,
    teamClicked
  });
}
