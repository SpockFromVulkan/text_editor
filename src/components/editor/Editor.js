import React, { Component, Fragment } from "react";
import "./Editor.css";
import Toolbar from "./toolbar/Toolbar";

class Editor extends Component {
  constructor(props) {
    super(props);
    this.state = { selection: null };
    this.currentDoc = window.localStorage.getItem("currentDoc");
    this.savedText = window.localStorage.getItem("savedText");
  }

  componentDidMount() {
    document.getElementById("textarea").innerHTML = this.savedText;
  }

  insertText() {
    document.getElementById("textarea").innerHTML = this.savedText;
  }

  render() {
    return (
      <Fragment>
        <Toolbar />
        <div
          title="Текстовая область"
          onLoad={this.insertText}
          id="textarea"
          placeholder="Введите текст"
          contentEditable="true"
        > g</div>
      </Fragment>
    );
  }
}

export default Editor;
