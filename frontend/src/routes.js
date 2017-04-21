import React from 'react';
import { Route, IndexRoute } from 'react-router';

import App from './pages/App';
import NotFound from './pages/NotFound';
import Login from './pages/Login';

export const getRoutes = (store) => {
    return (
         <Route path="/" component={App}>
            <Route path="login" component={Login} />
            <Route path="*" component={NotFound} />
        </Route>
    );
}
