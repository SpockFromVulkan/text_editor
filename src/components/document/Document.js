import React, { Component, Fragment } from "react";
import "./document.css";
import { Route, Switch, Redirect } from "react-router-dom";
import { Link } from "react-router-dom";

class Document extends Component {
  constructor(props) {
    super(props);
    this.TOKEN = window.localStorage.getItem("TOKEN");
    this.state = {
      anyDocs: false,
      reddoc: false,
      logout: false,
    };
    this.state.serverDocsId = [];
    this.state.serverDocsName = [];
    this.state.serverDocsText = [];
    this.userId = null;
  }
  getUserId() {
    let response = fetch("https://word4everyone.ml/api/CheckIfAuthorized", {
      method: "GET",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: "Bearer " + this.TOKEN,
      },
    })
      .then((response) => response.body)
      .then((rb) => {
        const reader = rb.getReader();
        return new ReadableStream({
          start(controller) {
            function push() {
              reader.read().then(({ done, value }) => {
                if (done) {
                  controller.close();
                  return;
                }
                controller.enqueue(value);
                push();
              });
            }
            push();
          },
        });
      })
      .then((stream) => {
        return new Response(stream, {
          headers: { "Content-Type": "text/html" },
        }).text();
      })
      .then((result) => {
        this.userID = result.substr(result.indexOf(": ") + 2, result.length);
        console.log(this.userID);
      });
  }

  refresh() {
    this.serverDocsId = [];
    this.serverDocsName = [];
    this.serverDocsText = [];
    console.log(this.TOKEN);
    let request = fetch("https://word4everyone.ml/api/Documents", {
      method: "GET",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: "Bearer " + this.TOKEN,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        data.forEach((element) => {
          this.serverDocsId.push(element.id);
          this.serverDocsName.push(element.name);
          this.serverDocsText.push(element.text);
        });
        this.serverDocsId.length != 0
          ? this.setState({ anyDocs: true })
          : this.setState({ anyDocs: false });
        console.log(this.serverDocsId);
        console.log(this.serverDocsName);
      });
  }
  componentDidMount() {
    this.refresh();
  }
  deleteDoc(name) {
    setTimeout(() => {
      console.log(name);
      let response = fetch(
        "https://word4everyone.ml/api/Documents/" +
          this.serverDocsId[this.serverDocsName.indexOf(name)],
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
            Authorization: "Bearer " + this.TOKEN,
          },
        }
      ).then(() => this.refresh());
    }, 1000);
  }
  renameDoc(name) {
    console.log(name);
    this.getUserId();
    setTimeout(() => {
      let customData = {
        id: this.serverDocsId[this.serverDocsName.indexOf(name)],
        name: prompt("Введите название файла"),
        text: this.serverDocsText[this.serverDocsName.indexOf(name)],
        userId: this.userID,
      };
      let dataPut = JSON.stringify(customData);
      console.log(customData);
      console.log(dataPut);
      let response = fetch(
        "https://word4everyone.ml/api/Documents/" +
          this.serverDocsId[this.serverDocsName.indexOf(name)],
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
            Authorization: "Bearer " + this.TOKEN,
          },
          body: dataPut,
        }
      ).then((response) => response.json());
      this.refresh();
    }, 1000);
  }

  createDoc(e) {
    console.log(e.target.textContent);
    if (e.target.textContent != "Создать") {
      window.localStorage.setItem("currentDoc", e.target.textContent); // Saving
      window.localStorage.setItem(
        "savedText",
        this.serverDocsText[this.serverDocsName.indexOf(e.target.textContent)]
      );
      console.log(window.localStorage.getItem("currentDoc"));
      console.log(window.localStorage.getItem("savedText"));
      this.setState({ reddoc: true });
    } else {
      this.setState({ reddoc: true });
    }
  }

  logout() {
    this.setState({ logout: true });
    window.localStorage.removeItem("TOKEN");
  }

  render() {
    return (
      <Fragment>
        {this.state.reddoc ? <Redirect to={"/editor"} /> : null}
        {this.state.logout ? <Redirect to={"/autorez"} /> : null}
        <input
          className="refr"
          type="button"
          value="Обновить"
          onClick={this.refresh.bind(this)}
        />
        <div className="all-doc">
          {this.state.anyDocs
            ? this.serverDocsName.map((element) => (
                <div className="doc">
                  <span className="titles" onClick={this.createDoc.bind(this)}>
                    {element}
                  </span>
                  <div
                    className="delete"
                    onClick={() => this.deleteDoc(element)}
                  >
                    Удалить!
                  </div>
                  <div
                    className="rename"
                    onClick={() => this.renameDoc(element)}
                  >
                    Переименовать!
                  </div>
                </div>
              ))
            : null}
        </div>
        <div
          className="creat"
          style={{
            width: "min-content",
            height: "min-content",
            position: "fixed",
            left: "1rem",
            top: "3rem",
          }}
          id="newDoc"
          onClick={this.createDoc.bind(this)}
        >
          Создать
        </div>
        <div
          className="leave"
          style={{
            width: "min-content",
            height: "min-content",
            position: "fixed",
            left: "1rem",
            top: "5rem",
          }}
          onClick={this.logout.bind(this)}
        >
          Выйти
        </div>
      </Fragment>
    );
  }
}
export default Document;
