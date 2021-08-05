import React, { Component, Fragment, useState } from "react";
import reactCSS from "reactcss";
import { Modal, Button, Slider, InputNumber, Row, Col, Switch } from "antd";
import "antd/dist/antd.css";
import { ChromePicker, GithubPicker } from "react-color";
import { Redirect } from "react-router-dom";

import "./toolbar.css";
import italic from "./italic.svg";
import bold from "./bold.svg";
import align_center from "./align-center.svg";
import left_align from "./left-align.svg";
import right_align from "./right-align.svg";
import hearing from "./hearing.svg";
import underline from "./underline.svg";
import save from "./save.svg";
import list from "./list.svg";
import format from "./format.svg";
import paint_roller from "./paint-roller.svg";
import text from "./text (1).svg";
import list_m from "./list-m.svg";
import undo from "./undo.svg";
import settings from "./settings.svg";
import strikethrough from "./strikethrough.svg";
import format_size from "./format-size.svg";
import microon from "./microphone (2).svg";

class Toolbar extends Component {
  constructor(props) {
    super(props);
    this.isRecorder = false;
    this.fl = true;
    this.mainchannel = [];
    this.recorder = null;
    this.recordingLength = 0;
    this.volume = null;
    this.mediaStream = null;
    this.sampleRate = 44100;
    this.context = 0;
    this.blob = null;
    this.selAreas = null;
    this.TOKEN = window.localStorage.getItem("TOKEN");
    this.serverDocsId = [];
    this.serverDocsName = [];
    this.userId = null;
    this.voices = null;
    this.utterance = null;
    this.state = {
      displayColorPicker: false,
      displayColorPicker2: false,
      FONT: false,
      SIZE: true,
      reddoc: false,
      modaldoc: false,
      inputValue: 1,
      switchvalue: false,
      defaultsize: 24,
    };
  }

  checkSpell() {
    let params = {
      language: "ru-RU",
      text: "онгар",
    };
    const pl = fetch("https://api.languagetoolplus.com/v2/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: params,
    })
      .then((pl) => pl.json())
      .then((pl) => console.log(pl));
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

  stopRecording() {
    this.recorder.disconnect(this.context.destination);
    this.mediaStream.disconnect(this.recorder);
  }

  startRecording() {
    console.log(this.blob);
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;
    navigator.getUserMedia(
      {
        audio: true,
      },
      (e) => {
        console.log("user consent");
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        this.context = new AudioContext();
        this.mediaStream = this.context.createMediaStreamSource(e);

        var bufferSize = 8192;
        var numberOfInputChannels = 1;
        var numberOfOutputChannels = 1;
        if (this.context.createScriptProcessor) {
          this.recorder = this.context.createScriptProcessor(
            bufferSize,
            numberOfInputChannels,
            numberOfOutputChannels
          );
        } else {
          this.recorder = this.context.createJavaScriptNode(
            bufferSize,
            numberOfInputChannels,
            numberOfOutputChannels
          );
        }
        this.recorder.onaudioprocess = (e) => {
          this.mainchannel.push(
            new Float32Array(e.inputBuffer.getChannelData(0))
          );
          this.recordingLength += bufferSize;
        };
        this.mediaStream.connect(this.recorder);
        this.recorder.connect(this.context.destination);
      },
      (e) => {
        console.error(e);
      }
    );
  }

  writeUTFBytes(view, offset, string) {
    for (var i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  flattenArray(channelBuffer, recordingLength) {
    var result = new Float32Array(recordingLength);
    var offset = 0;
    for (var i = 0; i < channelBuffer.length; i++) {
      var buffer = channelBuffer[i];
      result.set(buffer, offset);
      offset += buffer.length;
    }
    return result;
  }

  call_wit(forWhat) {
    const uri = "https://cors-anywhere.herokuapp.com/https://api.wit.ai/speech";
    const auth = "Bearer " + "SLZSYB75DVIHHCGX7Q6TE4FDC7THYIF6";
    switch (forWhat) {
      case "speech": {
        const pl = fetch(uri, {
          method: "POST",
          headers: {
            "Transfer-encoding": "chunked",
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "audio/wav",
            Authorization: auth,
          },
          body: this.blob,
        })
          .then((res) => res.json())
          .then((res) => {
            console.log(res.text);
            if (res.text != undefined)
              document.getElementById("textarea").innerHTML += " " + res.text;
          });
        break;
      }
    }
  }

  create_wav() {
    var mainBuffer = this.flattenArray(this.mainchannel, this.recordingLength);
    var interleaved = mainBuffer;

    var buffer = new ArrayBuffer(44 + interleaved.length * 2);
    var view = new DataView(buffer);
    this.writeUTFBytes(view, 0, "RIFF");
    view.setUint32(4, 44 + interleaved.length * 2, true);
    this.writeUTFBytes(view, 8, "WAVE");
    this.writeUTFBytes(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, this.sampleRate, true);
    view.setUint32(28, this.sampleRate * 4, true);
    view.setUint16(32, 4, true);
    view.setUint16(34, 16, true);
    this.writeUTFBytes(view, 36, "data");
    view.setUint32(40, interleaved.length * 2, true);
    var index = 44;
    var volume = 1;
    for (var i = 0; i < interleaved.length; i++) {
      view.setInt16(index, interleaved[i] * (0x7fff * volume), true);
      index += 2;
    }
    // our final blob
    console.log(view);
    this.blob = new Blob([view], { type: "audio/wav" });
  }

  handlerRecorder() {
    if (this.fl) {
      this.startRecording();
      this.fl = false;
      console.log("SASUKE");
    } else {
      this.fl = true;
      console.log("NARUTO");
      this.stopRecording();
      this.create_wav();
      console.log(this.blob);
      this.call_wit("speech");
      this.mainchannel = [];
      this.recorder = null;
      this.recordingLength = 0;
      this.volume = null;
      this.mediaStream = null;
      this.sampleRate = 44100;
      this.context = null;
      this.blob = null;
    }
  }

  //сохранение
  refresh() {
    this.serverDocsId = [];
    this.serverDocsName = [];
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
        });
        console.log(this.serverDocsId);
        console.log(this.serverDocsName);
      });
  }

  refreshFile(customData, id) {
    this.getUserId();
    setTimeout(() => {
      console.log("userID" + this.userId);
      let customDataModified = {
        id: id,
        name: customData.name,
        text: customData.text,
        userId: this.userID,
      };
      let dataPut = JSON.stringify(customDataModified);
      console.log(id);
      console.log(dataPut);
      let response = fetch("https://word4everyone.ml/api/Documents/" + id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          Authorization: "Bearer " + this.TOKEN,
        },
        body: dataPut,
      }).then((response) => response.json());
    }, 1000);
  }
  loadFile(customData) {
    let data = JSON.stringify(customData);
    console.log(data);
    let response = fetch("https://word4everyone.ml/api/Documents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: "Bearer " + this.TOKEN,
      },
      body: data,
    })
      .then((response) => response.json())
      .then((response) => console.log(response));
  }

  load() {
    let customData = {
      name: document.getElementById("namefile").value,
      text: document.getElementById("textarea").innerHTML,
    };
    console.log(this.serverDocsName);
    if (this.serverDocsName.indexOf(customData.name) != -1) {
      console.log("true");
      this.refreshFile(
        customData,
        this.serverDocsId[this.serverDocsName.indexOf(customData.name)]
      );
    } else {
      console.log("false");
      this.loadFile(customData);
    }
    this.refresh();
  }

  findVoice(lang) {
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
      this.voices = window.speechSynthesis.getVoices();
    }, 1000);
    if (!window.speechSynthesis) {
      return;
    }
    this.utterance = new SpeechSynthesisUtterance("");
    this.utterance.lang = "ru-RU";
    this.utterance.voice = this.findVoice(this.utterance.lang);
    this.utterance.volume = 1;
    this.utterance.pitch = 1;
    this.utterance.rate = 0.9;
    window.speechSynthesis.speak(this.utterance);
  }

  handleKeyPress = (event) => {
    if (event.key == "Tab") {
      this.ReadToText();
    }
  };
  componentDidMount() {
    this.refresh();
    this.loadvoices();
    try {
      document.getElementById("namefile").value =
        window.localStorage.getItem("currentDoc");
    } catch (e) {
      document.getElementById("namefile").value = "Новый файл";
    }
    document.addEventListener("keyup", this.handleKeyPress);
    document.getElementById("textarea").focus();
    this.sizechange();
  }

  //Прочтение текста
  ReadToText() {
    if (document.activeElement.tagName == "DIV") {
      this.utterance.text = document.getElementById("textarea").textContent;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(this.utterance);
    } else if (document.activeElement.tagName == "INPUT") {
      this.utterance.text = document.activeElement.value;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(this.utterance);
    } else if (document.activeElement.tagName == "IMG") {
      this.utterance.text = document.activeElement.alt;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(this.utterance);
    }
  }

  Heartext() {
    const selected = document.getSelection(); //переменная выделенной информации
    if (selected != "") {
      this.utterance.text = selected;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(this.utterance); //вызываю функцию указываю див
    } else {
      this.utterance.text = document.getElementById("textarea").textContent;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(this.utterance);
    }
  }

  restoreSelection(range) {
    if (range) {
      if (window.getSelection) {
        let sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      } else if (document.selection && range.select) {
        range.select();
      }
    }
  }

  handleClick = (event) => {
    this.setState({
      displayColorPicker: !this.state.displayColorPicker,
    });
    event.preventDefault();
  };

  handleClick2 = (event) => {
    this.setState({
      displayColorPicker2: !this.state.displayColorPicker2,
    });
    event.preventDefault();
  };

  handleClose = () => {
    this.setState({ displayColorPicker: false });
  };

  handleClose2 = () => {
    this.setState({ displayColorPicker2: false });
  };

  clcel = (event) => {
    event.preventDefault();
  };

  handleChange = (color, event) => {
    this.setState({ color: color.rgb });

    event.preventDefault();
    document.execCommand("styleWithCSS", false, true);
    document.execCommand(
      "foreColor",
      true,
      `rgba(${color.rgb["r"]},${color.rgb["g"]},${color.rgb["b"]},${color.rgb["a"]})`
    );
  };

  handleChange2 = (color, event) => {
    this.setState({ color: color.rgb });

    event.preventDefault();
    document.execCommand("styleWithCSS", false, true);
    document.execCommand(
      "backColor",
      true,
      `rgba(${color.rgb["r"]},${color.rgb["g"]},${color.rgb["b"]},${color.rgb["a"]})`
    );
  };

  fontname() {
    if (this.state.FONT) {
      this.setState({
        FONT: false,
      });
    } else {
      this.setState({
        FONT: true,
      });
    }
  }

  sizename() {
    if (this.state.SIZE) {
      this.setState({
        SIZE: false,
      });
    } else {
      this.setState({
        SIZE: true,
      });
    }
  }

  homefont() {
    document.getElementById("select").value = "";
  }

  homesize() {
    document.getElementById("select2").value = "";
  }

  sizechange() {
    let value = this.state.defaultsize;
    if (document.getElementById("select2").value != "РАЗМЕР") {
      value = document.getElementById("select2").value;
    }
 
    let selAreas = document.getSelection();
    let tempSelection = selAreas.getRangeAt(0);
    console.log(tempSelection);
    if (tempSelection.startOffset == tempSelection.endOffset) {
      let startPos = tempSelection.startOffset;
      let endPos = tempSelection.endOffset + 1;
      if (tempSelection.startContainer.tagName == "DIV") {
        tempSelection.startContainer.innerHTML =
          tempSelection.startContainer.innerHTML.slice(0, startPos) +
          "&nbsp" +
          tempSelection.startContainer.innerHTML.slice(startPos);
        let range = new Range();
        range.setStart(tempSelection.startContainer, startPos);
        range.setEnd(tempSelection.endContainer, endPos);
        selAreas.removeAllRanges();
        selAreas.addRange(range);
        console.log(selAreas);
      } else {
        console.log(
          tempSelection.startContainer.parentElement.innerHTML.slice(
            startPos + 5
          )
        );

        tempSelection.startContainer.parentElement.innerHTML =
          tempSelection.startContainer.parentElement.innerHTML.slice(
            0,
            startPos
          ) +
          "&nbsp" +
          tempSelection.startContainer.parentElement.innerHTML.slice(startPos);
        let range = new Range();
        range.setStart(tempSelection.startContainer.childNodes[0], startPos);
        range.setEnd(tempSelection.endContainer.childNodes[0], endPos);
        selAreas.removeAllRanges();
        selAreas.addRange(range);
      }

      document.execCommand("fontSize", false, "1");
      let arr = document.getElementsByTagName("font");
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].size == "1") {
          arr[i].removeAttribute("size");
          arr[i].style.fontSize = value + "pt";
        }
      }
    } else {
      document.execCommand("fontSize", false, "1");
      let arr = document.getElementsByTagName("font");
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].size == "1") {
          arr[i].removeAttribute("size");
          arr[i].style.fontSize = value + "pt";
        }
      }
    }
    /*     document.execCommand("fontSize", false, value); */
    if (this.state.SIZE) {
      this.setState({
        SIZE: false,
      });
    } else {
      this.setState({
        SIZE: true,
      });
    }
  }

  fontchange() {
    let value = document.getElementById("select").value;
    document.execCommand("fontName", false, value);
    if (this.state.FONT) {
      this.setState({
        FONT: false,
      });
    } else {
      this.setState({
        FONT: true,
      });
    }
  }

  GoBack() {
    window.localStorage.removeItem("currentDoc");
    window.localStorage.removeItem("savedText");
    this.setState({ reddoc: true });
  }

  onChange = (value) => {
    this.setState({
      inputValue: value,
    });
    window.localStorage.setItem("volume", value);
    this.utterance.volume = window.localStorage.getItem("volume") / 100;
    this.utterance.text = window.localStorage.getItem("volume");
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(this.utterance);
  };

  onChangesw(checked) {
    this.setState({ switchvalue: !this.state.switchvalue });
    var css = `#textarea::selection { background-color: ${
        this.state.switchvalue ? "#1890FF" : "black"
      }; }`,
      head = document.head || document.getElementsByTagName("head")[0],
      style = document.createElement("style");

    style.type = "text/css";
    style.appendChild(document.createTextNode(css));

    head.appendChild(style);
  }

  render(props) {
    const styles = reactCSS({
      default: {
        color: {
          width: "36px",
          height: "14px",
          borderRadius: "2px",
        },
        swatch: {
          padding: "5px",
          background: "#fff",
          borderRadius: "1px",
          boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
          display: "inline-block",
          cursor: "pointer",
        },
        popover: {
          position: "absolute",
          zIndex: "2",
        },
        cover: {
          position: "fixed",
          top: "0px",
          right: "0px",
          bottom: "0px",
          left: "0px",
        },
      },
    });

    const showModal = () => {
      this.setState({ modaldoc: true });
    };

    const handleOk = () => {
      this.setState({ modaldoc: false });
    };

    const handleCancel = () => {
      this.setState({ modaldoc: false });
    };
    const { inputValue } = this.state;

    return (
      <Fragment>
        {this.state.reddoc ? <Redirect to={"/document"} /> : null}
        <img
          src={undo}
          onClick={() => this.GoBack()}
          style={{
            fontSize: "4rem",
            color: "black",
            width: "4rem",
            position: "fixed",
            left: "2rem",
            top: "2rem",
          }}
          alt="Вернуться к документам"
          tabIndex="1"
        />
        <input
          style={{
            position: "fixed",
            left: "1rem",
            top: "10rem",
            width: "7.3rem",
          }}
          id="namefile"
          placeholder="Название файла"
          type="text"
        ></input>

        <img
          src={settings}
          onClick={showModal}
          style={{
            fontSize: "4rem",
            color: "black",
            width: "4rem",
            position: "fixed",
            left: "100rem",
            top: "2rem",
          }}
          alt="Настройки"
          tabIndex="1"
        />
        {this.state.modaldoc ? (
          <Modal
            title="Настройки"
            visible={true}
            onOk={handleOk}
            onCancel={handleCancel}
          >
            <p>Громкость голоса</p>
            <Row>
              <Col span={12}>
                <Slider
                  min={1}
                  max={100}
                  onChange={this.onChange}
                  value={typeof inputValue === "number" ? inputValue : 0}
                />
              </Col>
              <Col span={4}>
                <InputNumber
                  min={1}
                  max={100}
                  style={{ margin: "0 16px" }}
                  value={inputValue}
                  onChange={this.onChange}
                />
              </Col>
            </Row>

            <p>Альтернативное выделение (черный)</p>
            <Switch
              onChange={this.onChangesw.bind(this)}
              defaultChecked={this.state.switchvalue}
            />
          </Modal>
        ) : null}

        {this.state.FONT ? (
          <div
            style={{
              width: "min-content",
              height: "min-content",
              position: "fixed",
              left: "45rem",
              top: "3.5rem",
            }}
          >
            <select
              id="select"
              onClick={() => this.homefont()}
              /*   onClick={this.remove} */
              onChange={() => this.fontchange()}
            >
              <option hidden>ШРИФТЫ</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Arial">Arial</option>
              <option value="Comic Sans MS">Comic Sans MS</option>
            </select>
          </div>
        ) : null}
        {this.state.SIZE ? (
          <div
            style={{
              width: "min-content",
              height: "min-content",
              position: "fixed",
              left: "55rem",
              top: "3.5rem",
            }}
          >
            <select
              id="select2"
              onClick={() => this.homesize()}
              /*   onClick={this.remove} */
              onChange={() => this.sizechange()}
            >
              <option style={{ color: "black" }} className="hidt" hidden>
                РАЗМЕР
              </option>
              <option value="14">14</option>
              <option value="16">16</option>
              <option value="18">18</option>
              <option value="20">20</option>
              <option value="22">22</option>
              <option value="24">24</option>
              <option value="26">26</option>
            </select>
          </div>
        ) : null}
        <section className="toolbar">
          <div className="firstrow">
            <img
              src={hearing}
              onClick={() => this.Heartext()}
              style={{ fontSize: "4rem", color: "black", width: "3rem" }}
              alt="ЧТЕНИЕ"
              tabIndex="1"
            />
            <img
              src={save}
              onClick={() => this.load()}
              style={{ fontSize: "4rem", color: "black", width: "3rem" }}
              alt="Сохранить"
              tabIndex="2"
            />
            <img
              src={microon}
              onClick={() => this.handlerRecorder()}
              style={{ fontSize: "4rem", color: "black", width: "3rem" }}
              alt="Голосовой ввод текста"
              tabIndex="3"
            />
            <img
              src={text}
              onClick={() => this.fontname()}
              style={{ fontSize: "4rem", color: "black", width: "3rem" }}
              alt="Выбрать шрифт"
              tabIndex="4"
            />
            <img
              src={format_size}
              onClick={() => this.sizename()}
              style={{ fontSize: "4rem", color: "black", width: "3rem" }}
              alt="Выбрать размер шрифта"
              tabIndex="5"
            />
            <img
              src={bold}
              onClick={() => {
                document.execCommand("bold", false, null);
              }}
              style={{ fontSize: "4rem", color: "black", width: "3rem" }}
              alt="Выделить жирным"
              tabIndex="6"
            />
            <img
              src={italic}
              onClick={() => document.execCommand("italic", false, null)}
              style={{ fontSize: "4rem", color: "black", width: "3rem" }}
              alt="Выделить курсивом"
              tabIndex="7"
            />
            <img
              src={strikethrough}
              onClick={() => document.execCommand("strikeThrough", false, null)}
              style={{ fontSize: "4rem", color: "black", width: "3rem" }}
              alt="Зачеркнуть текст линией"
              tabIndex="8"
            />
            <img
              src={underline}
              onClick={() => document.execCommand("underline", false, null)}
              style={{ fontSize: "4rem", color: "black", width: "3rem" }}
              alt="Подчеркнуть текст"
              tabIndex="9"
            />
          </div>
          <div className="secondtrow">
            <img
              src={left_align}
              onClick={() => document.execCommand("justifyLeft", false, null)}
              style={{ fontSize: "4rem", color: "black", width: "3rem" }}
              alt="Выровнять по левому краю"
              tabIndex="10"
            />
            <img
              src={align_center}
              onClick={() => document.execCommand("justifyCenter", false, null)}
              style={{ fontSize: "4rem", color: "black", width: "3rem" }}
              alt="Выровнять по центру"
              tabIndex="11"
            />
            <img
              src={right_align}
              onClick={() => document.execCommand("justifyRight", false, null)}
              style={{ fontSize: "4rem", color: "black", width: "3rem" }}
              alt="Выровнять по правому краю"
              tabIndex="12"
            />
            <img
              src={list}
              onClick={() => document.execCommand("insertOrderedList", false)}
              style={{ fontSize: "4rem", color: "black", width: "3rem" }}
              alt="Сформировать нумерованный список"
              tabIndex="13"
            />
            <img
              src={list_m}
              onClick={() =>
                document.execCommand("insertUnorderedList", false, null)
              }
              style={{ fontSize: "4rem", color: "black", width: "3rem" }}
              alt="Сформировать маркерованный список"
              tabIndex="14"
            />

            <div>
              <div>
                <img
                  src={format}
                  onClick={this.handleClick}
                  style={{ fontSize: "4rem", color: "black", width: "3rem" }}
                  alt="Изменить цвет текста"
                  tabIndex="15"
                />
              </div>

              {this.state.displayColorPicker ? (
                <div style={styles.popover}>
                  <div style={styles.cover} onClick={this.handleClose} />
                  <ChromePicker
                    color={this.state.color}
                    onClick={this.clcel}
                    onChange={this.handleChange}
                  />
                </div>
              ) : null}
            </div>

            <div>
              <div>
                <img
                  src={paint_roller}
                  onClick={this.handleClick2}
                  style={{ fontSize: "4rem", color: "black", width: "3rem" }}
                  alt="Выделить текст цветом"
                  tabIndex="16"
                />
              </div>

              {this.state.displayColorPicker2 ? (
                <div style={styles.popover}>
                  <div style={styles.cover} onClick={this.handleClose2} />
                  <GithubPicker
                    color={this.state.color}
                    onClick={this.clcel}
                    onChange={this.handleChange2}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </Fragment>
    );
  }
}

export default Toolbar;
