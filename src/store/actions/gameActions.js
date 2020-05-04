import axios from 'axios';
import { serverUrl } from '../../config/serverUrl';
import { bindActionCreators } from 'redux';

axios.defaults.baseURL = serverUrl;

export function loadGame(gameName)
{
  return {
    type: 'LOAD_GAME',
    payload: axios.get(gameName)
  };
}

export function updateGame(game)
{
  return {
    type: 'UPDATE_GAME',
    payload: game
  };
}

//THUNK
export const startNewGame = (gameName) => {
  return async function (dispatch) {
    try {
      const {data} = await axios.put(gameName + '/newGame', {
        gameName
      })
      dispatch(updateGame(data))
    } catch (error) {
      console.error(error)
    }
  }
}

export function endTurn(gameName)
{
  axios.put(gameName + '/endTurn');
}

// export const endTurn = (gameName) => {
//   return async function (dispatch) {
//     try {
//       const {data} = await axios.put(gameName + '/endTurn')
//       dispatch(updateGame(data))
//     } catch (error) {
//       console.error(error)
//     }
//   }
// }

export function cardClick(gameName, cardIndex, teamClicked)
{
  axios.put(gameName + '/cardClicked', {
    cardIndex,
    teamClicked
  });
}

// export const cardClick = (gameName, cardIndex, teamClicked) => {
//   return async function (dispatch) {
//     try {
//       const {data} = await axios.put(gameName + '/cardClicked', {
//         cardIndex,
//         teamClicked
//       })
//       dispatch(updateGame(data))
//     } catch (error) {
//       console.error(error)
//     }
//   }
// }
