import * as React from "react";
import { render } from "react-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";

import Home from "~/views/Home";
import Login from "~/views/Login";
import CreateAccount from "~/views/CreateAccount";
import configureStore, { ApplicationState, authAction } from "~/services/store";
import Spinner from "~/components/Spinner"
import WaitState from "~/components/WaitState"
import ApiProvider from "~/services/api";
import "~/services/i18n";
import "~/style.scss";

function App() {
  const userToken = useSelector((state: ApplicationState) => state.user);
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(authAction());
  }, []);

  return (
    <ApiProvider value={userToken}>
      <React.Suspense fallback={<Spinner />}>
        <WaitState
          selector={state => !state.isLoadingUser}
          fallback={<Spinner />}>
          <Router>
            <Switch>
              <Redirect exact from="/" to="/h/" />
              <Route path="/h/" component={Home} />
              <Route path="/login" component={Login} />
              <Route path="/create" component={CreateAccount} />
            </Switch>
          </Router>
        </WaitState>
      </React.Suspense>
    </ApiProvider>
  );
}

render(
  <Provider store={configureStore()}>
    <App />
  </Provider>
  , document.querySelector("#root"));
