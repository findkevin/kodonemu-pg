const initialState = {
  cards: [],
  gameName: null,
  blueTurn: false,
  redCards: 0,
  blueCards: 0,
  winner: null,
  blueTeamFirst: false
}

export default function reducer(state = initialState, action)
{
  switch (action.type)
  {
    case 'LOAD_GAME_FULFILLED':
    {
      return action.payload.data
    }
    case 'UPDATE_GAME':
    {
      return state = {...action.payload}
    }
    default:
    {
      return state;
    }
  }
}
