import React, { Component, Fragment } from "react";
import "./style.css";
import { Link } from "react-router-dom";
import desctopIcon from "./img/desctop-ico.svg";
import webIcon from "./img/web-ico.svg";
import mobileIcon from "./img/mobile-ico.svg";
import logoIcon from "./img/logo-gray.svg";

class Navigation extends Component {
  render() {
    return (
      <Fragment>
        <header className="header">
          <img src={logoIcon} alt="Логотип Text Editor for all" />
          <h1 className="hello">Здравствуйте</h1>
          <Link to="/autorez">
          <a className="button-info">Авторизация</a>
          </Link>
        </header>
        <main>
          <h2 className="h22">Выберите как вам удобнее пользоваться приложением</h2>
          <section className="all-card">
            <section className="card">
              <h3 className="h3">Настольное приложение</h3>
              <img
                className="ico"
                src={desctopIcon}
                alt="Иконка настольного приложения"
              />
              <h4>Расширенный функционал</h4>
            </section>
            <section className="card">
              <h3 className="h3">Продолжить на сайте</h3>
              <Link to="/editor">
                <img className="ico" src={webIcon} alt="Иконка веб-сайта" />
              </Link>
              <h4>Немедленный старт</h4>
            </section>
            <section className="card">
              <h3 className="h3">Мобильное приложение</h3>
              <img
                className="ico"
                src={mobileIcon}
                alt="Иконка мобильного приложения"
              />
              <h4>Скорость и удобство</h4>
            </section>
          </section>
        </main>
      </Fragment>
    );
  }
}

export default Navigation;
