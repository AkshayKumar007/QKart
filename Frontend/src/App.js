import 'antd/dist/antd.css';
import React, { useLayoutEffect } from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';
import Checkout from './components/Checkout';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Search from './components/Search';
import Thanks from './components/Thanks';

export const config = {
  endpoint: `https://abc.xyz.com/api/v1`,
};

export default function App(props) {
  const location = useLocation();
  useLayoutEffect(() => {
    window && window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="App">
      <Switch>
        <Route exact path="/" render={() => <Home />} />
        <Route path="/register" render={() => <Register />} />
        <Route path="/login" render={() => <Login />} />
        <Route path="/products" render={() => <Search />} />
        <Route path="/checkout">
          <Checkout />
        </Route>
        <Route path="/thanks">
          <Thanks />
        </Route>
        <Route render={() => <Home />} />
      </Switch>
    </div>
  );
}
