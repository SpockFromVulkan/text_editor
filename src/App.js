import React, { Component, Fragment } from "react";
import Editor from "./components/editor/Editor";
import Document from "./components/document/Document";
import Autorez from "./components/autorez/Autorez";
import Navigation from "./components/navigation/Navigation";
import "./App.css";
import { Route, Switch, Redirect } from "react-router-dom";

class App extends Component {
  render() {
    const { history } = this.props;
    

    return (
      <Switch>
        <Route history={history} exact path="/navigation" component={Navigation} />
        <Route history={history} exact path="/editor" component={Editor} />
        <Route history={history} exact path="/autorez" component={Autorez} />
        <Route history={history} exact path="/document" component={Document} />
        <Redirect from="/" to="/navigation" />
     {/*    <Route component={Errorr}/> */}
      </Switch>
    );
  }
}

export default App;
