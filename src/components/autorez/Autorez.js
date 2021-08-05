import React, { Component, Fragment } from "react";
import "./autorez.css";
import ReactDOM from "react-dom";
import { Link } from "react-router-dom";
import { Route, Switch, Redirect } from "react-router-dom";
import { Form, Input, Button, Checkbox } from "antd";
import "antd/dist/antd.css";

class Autorez extends Component {
  constructor(props) {
    super(props);
    this.state = { reddoc: false };
    this.voices = null;
    this.utterance = null;
  }
  regist() {
    console.log(document.getElementsByClassName("ant-input"));
    let customData = {
      email: document.getElementsByClassName("login-r")[0].value,
      password: document.getElementsByClassName("ant-input")[3].value,
      passwordConfirm: document.getElementsByClassName("ant-input")[4].value,
    };

    let data = JSON.stringify(customData);
    console.log(data);
    let response = fetch("https://word4everyone.ml/api/Auth/Register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: data,
    })
      .then((response) => {
        if (response.ok) {
          window.localStorage.setItem("TOKEN", data.message);
          this.setState({ reddoc: true });
          this.utterance.text = "Регистрация прошла успешно";
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(this.utterance);
          return response.json();
        } else {
          this.utterance.text = "Введены неверные данные для регистрации";
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(this.utterance);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  componentDidMount() {
    this.loadvoices();
  }

  findVoice(lang) {
    //входной параметр язык lang
    for (let i = 0; i < this.voices.length; i++) {
      //ищем русский голос
      if (this.voices[i].lang === lang) {
        return this.voices[i];
      }
    }
    return null;
  }

  loadvoices() {
    this.voices = window.speechSynthesis.getVoices();
    setTimeout(function () {
      //принимает 2 аргумента функцию и время в милисекундах
      this.voices = window.speechSynthesis.getVoices();
    }, 1000);

    if (!window.speechSynthesis) {
      return;
    }
    this.utterance = new SpeechSynthesisUtterance("");
    this.utterance.lang = "ru-RU";
    this.utterance.voice = this.findVoice(this.utterance.lang); //вызываем функцию поиска голоса
    this.utterance.volume = 1;
    this.utterance.pitch = 1;
    this.utterance.rate = 0.9;
    window.speechSynthesis.speak(this.utterance);
  }

  send() {
    let customData = {
      email: document.getElementsByClassName("login")[0].value,
      password: document.getElementsByClassName("ant-input")[1].value,
    };

    let data = JSON.stringify(customData);
    const promise = fetch("https://word4everyone.ml/api/Auth/Login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: data,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.isSuccess) {
          window.localStorage.setItem("TOKEN", data.message);
          this.utterance.text =
            "Авторизация прошла успешно" /* +customData.email */;
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(this.utterance);
          this.setState({ reddoc: true });
        } else {
          this.utterance.text = "Введены неверные данные для авторизации";
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(this.utterance);
        }
      });
  }

  render() {
    const layout = {
      labelCol: {
        span: 8,
      },
      wrapperCol: {
        span: 16,
      },
    };
    const tailLayout = {
      wrapperCol: {
        offset: 8,
        span: 16,
      },
    };

    return (
      <Fragment>
        {this.state.reddoc ? <Redirect to={"/document"} /> : null}
        <div className="main">
          <div className="forms">
            <h1 className="h11">Авторизация</h1>
            <Form
              {...layout}
              name="basic"
              initialValues={{
                remember: true,
              }}
            >
              <Form.Item
                label="Email"
                name="username"
                rules={[
                  {
                    required: true,
                    message: "Please input your username!",
                  },
                ]}
              >
                <Input className="login" />
              </Form.Item>

              <Form.Item
                label="Пароль"
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Please input your password!",
                  },
                ]}
              >
                <Input.Password className="password" />
              </Form.Item>

              <Form.Item {...tailLayout}>
                <Button
                  type="primary"
                  htmlType="submit"
                  onClick={() => this.send()}
                >
                  Подтвердить
                </Button>
              </Form.Item>
            </Form>
          </div>

          <div className="forms-r">
            <h1 className="h11">Регистрация</h1>
            <Form
              {...layout}
              name="basic"
              initialValues={{
                remember: true,
              }}
            >
              <Form.Item
                label="Email"
                name="username"
                rules={[
                  {
                    required: true,
                    message: "Please input your username!",
                  },
                ]}
              >
                <Input className="login-r" />
              </Form.Item>

              <Form.Item
                className="password-r"
                label="Пароль"
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Please input your password!",
                  },
                ]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item
                className="password-rr"
                label="Подтвердить пароль"
                name="password-с"
                rules={[
                  {
                    required: true,
                    message: "Please input your password!",
                  },
                ]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item {...tailLayout}>
                <Button
                  type="primary"
                  htmlType="submit"
                  onClick={() => this.regist()}
                >
                  Подтвердить
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </Fragment>
    );
  }
}
export default Autorez;
