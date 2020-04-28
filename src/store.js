import { createStore, applyMiddleware } from "redux"; //applyMiddleware
import reducer from "./reducers";

import logger from 'redux-logger'; // https://github.com/evgenyrodionov/redux-logger
import thunk from 'redux-thunk'; // https://github.com/gaearon/redux-thunk
import promise from 'redux-promise-middleware';

// const middleware = applyMiddleware(promise(), thunk, logger);

export default createStore(reducer, applyMiddleware(promise, thunk, logger));
