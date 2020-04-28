export default function reducer(state = {
  role: 'Player',
}, action)
{
  switch(action.type)
  {
    case 'CHANGE_ROLE':
    {
      const {role} = action;
      return state = {...state, role};
    }
    default:
    {
      return state;
    }
  }
}
