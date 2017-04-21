/* global process window */
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { syncHistoryWithStore, routerMiddleware } from 'react-router-redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { Router, browserHistory } from 'react-router';

import rootReducer from './reducers';
import { getRoutes } from './routes';

import './less/app.less';

const loggerMiddleware = createLogger();

const store = createStore(
  rootReducer,
  applyMiddleware(
    thunkMiddleware,
    loggerMiddleware, // neat middleware that logs actions
    routerMiddleware(browserHistory)
  )
);

// Create an enhanced history that syncs navigation events with the store
const history = syncHistoryWithStore(browserHistory, store);

ReactDOM.render(
  <Provider store={store}>
    <Router history={history} routes={getRoutes(store)} />
  </Provider>, document.getElementById('body'));

if (process.env.NODE_ENV !== 'production') {
    window.React = React; // Enable react devtools
}
