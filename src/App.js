import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

import './App.css';
import Message from "./components/Message";


const socket = io("ws://localhost:6969", {
  withCredentials: true,
  extraHeaders: {
    "my-custom-header": "abcd"
  }
});

function App() {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(socket.connected);

  const formRef = useRef(null);
  const inputRef = useRef(null);
  const messagesRef = useRef(null);

  function sendMessage(e) {
    const content = inputRef.current.value.trim();
    inputRef.current.value = "";
    e.preventDefault();

    if (content === "") {
      return;
    }
  
    if (content[0] === "/") { // is a command
      let command;
      const indexOfSpace = content.slice(1).indexOf(" ");
      if (indexOfSpace === -1) {
        command = content.slice(1);
      }
      else {
        command = content.slice(1, indexOfSpace);
      }

      let shouldReturn = true;
      switch (command) {
        case "clear":
        case "cls":
          setMessages([]);
          break;
        default:
          shouldReturn = false; 
      }
      if (shouldReturn) {
        return // prevent emitting message
      }
    }

      socket.emit("message", {
        content: content,
        id: sessionStorage.getItem("id")
      });
  }

  function scrollMessagesToBottom(e) {
    const el = messagesRef.current;
    if (el.scrollHeight - el.scrollTop - el.clientHeight <= 96) {
      el.scrollTop = el.scrollHeight;
    }
  }

  function forceScrollMessagesToBottom(e) {
    const el = messagesRef.current;
    //el.scrollTop = el.scrollHeight;
    el.scroll({ top: el.scrollHeight, behavior: "smooth"})
  }


  useEffect(() => {
    const input = inputRef.current;

    let keysPressed = {};
    input.addEventListener("keydown", e => {
      keysPressed[e.key] = true;
      if (keysPressed.Shift && keysPressed.Enter) {
        //e.preventDefault();
        //input.value += "\n";
        keysPressed = {};
      }
      if (keysPressed.Enter) {
        sendMessage(e);
        keysPressed = {};
      }

      //console.log(keysPressed);
      
    });

    socket.on('connection', (data) => {
      // TODO: snackbar success connected
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      // TODO: snackbar error disconnected
      setIsConnected(false);
    });

    socket.on('userJoin', (data) => {
      const [left, right] = data.joinMessage.split('{{name}}');
      
      const content = left + data.who + right;

      const messageData = {
        name: data.name,
        color: data.color,
        timestamp: data.timestamp,
        content: content,
      }

      setMessages(arr => [...arr, messageData]);
      })

    socket.on("id", (_id) => {
      sessionStorage.setItem("id", _id);
    })

    socket.on('message', (data) => {
      setMessages(arr => [...arr, data]);
    });
  }, []);

  useEffect(() => {
    scrollMessagesToBottom(messagesRef);
  }, [messages]);

  return (
    <div className='App'>
      <div className='main-container'>
        <div className="row">
          <div className="col">
            <div ref={messagesRef} className='messages'>
              {messages.map((data, i) => (
                  <Message 
                  key={i} 
                  name={data.name} 
                  timestamp={new Date(data.timestamp).toLocaleTimeString()} 
                  color={data.color} 
                  content={data.content}
                  />
              ))}
            </div>
          </div>
          <div className="col">
            <div className="users">
              Users
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <div className="input">
              <form id="form" ref={formRef}>
                <textarea ref={inputRef} id="messageInput" rows="4" className="messageInput" autoFocus placeholder="Enter Your Message"></textarea>
              </form>
            </div>
          </div>
          <div className="col">
            <div className="settings">
              Settings
            </div>
          </div>
        </div>

        <button className="button-scroll-down" onClick={forceScrollMessagesToBottom}></button>
      </div>
    </div>
  );
}

export default App;
