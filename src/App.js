import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

import './App.css';
import Message from "./components/Message";


const socket = io("ws://localhost:6969", {
  withCredentials: false,
  //extraHeaders: {
  //  "my-custom-header": ""
  //}
});

// disable context menu on rightclick
document.addEventListener("contextmenu", function (e){
  e.preventDefault();
}, false);

let id;
function App() {
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
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

    const indexOfSpace = content.slice(1).indexOf(" ");
    const argsNotSplit = content.slice(indexOfSpace + 2);
    const args = argsNotSplit.split(" ");

    let command;
    if (indexOfSpace === -1) {
      command = content.slice(1);
    }
    else {
      command = content.slice(1, indexOfSpace+1);
    }
  
    if (content[0] === "/") { // is a command
      switch (command) {
        case "clear":
        case "cls":
          setMessages([]);
          return;
      }
    }

    if ( // message starts with @ and after that there are 20 non space characters
        content[0] === "@" &&
        Array.from(content.slice(1, 21)).filter((c) => c != " ").length === 20
        ) {

      let message = "";
      if (argsNotSplit !== command) {
        message = argsNotSplit;
      }

      if (!message) {
        return;
      }

      socket.emit("privateMessage", {
        content: argsNotSplit,
        targetId: command
      })
      return;
    }

    socket.emit("message", {
      content: content,
      id: id
    });

      //socket.emit("privateMessage", {
      //  content: content,
      //  id: id
      //});
  }
  

  function scrollMessagesToBottom(e, scrollTopBefore) {
    const el = messagesRef.current;
    //console.table({
    //  "el.scrollHeight": el.scrollHeight,
    //  "el.scrollTop": el.scrollTop,
    //  "el.clientHeight": el.clientHeight,
    //  "scrollPosition": el.scrollHeight - el.scrollTop - el.clientHeight,
    //  "scrollTopBefore": scrollTopBefore
    //})

    // window.innerHeight + window.scrollY >= document.body.offsetHeight)
    //if (el.scrollHeight - el.scrollTop - el.clientHeight <= 5) {
      el.scrollTop = el.scrollHeight;
    // }
  }

  function forceScrollMessagesToBottom(e) {
    const el = messagesRef.current;
    el.scroll({ top: el.scrollHeight, behavior: "smooth"})
  }

  useEffect(() => {
    socket.on('connection', (data) => {
      // TODO: snackbar success connected
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      // TODO: snackbar error disconnected
      setIsConnected(false);
    });

    socket.on("id", (_id) => {
        id = _id
    });

    socket.on('message', (data) => {
      setMessages(arr => [...arr, data]);
    });

    socket.on('userJoin', (data) => {
      // extract before and after {{name}} from data.joinMessage 
      const [left, right] = data.joinMessage.split('{{name}}');

      // create new object with actual content
      const messageData = {content: left + data.who + right, ...data};
      delete messageData.who; // remove unnecessary key

      setMessages(arr => [...arr, messageData]);
    });

    socket.on('nameChange', (newName) => {
      setName(newName);
    })

    socket.on('colorChange', (newColor) => {
      setColor(newColor);
    })

    socket.on('onlineUsers', (onlineUsers) => {
      setOnlineUsers(onlineUsers);
    });
    
  }, []);

  function handleTextAreaKeyPresses(e) {
    if (e.key === 'Enter' && e.shiftKey) {
      return;
    }        
    if (e.key === 'Enter') {
      sendMessage(e);
    } 
  }

  useEffect(() => {
    const scrollTopBefore = messagesRef.current.scrollTop;
    scrollMessagesToBottom(messagesRef, scrollTopBefore);
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
                  socketid={data.socketId}
                  isservermessage={data.isServerMessage || false}
                  />
              ))}
            </div>
          </div>
          <div className="col">
            <div className="online">
              <p className="online-counter">Online: {onlineUsers.length}</p>
              <div className="users">
                {onlineUsers.map((user, i) => (
                  <p 
                  key={i}
                  style={{color: user.color}}
                  className="user"
                  socketid={user.socketId}
                  name={user.name}
                  >
                  {user.name}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <div className="input">
              <form id="form" ref={formRef}>
                <textarea 
                onKeyDown={handleTextAreaKeyPresses}
                ref={inputRef}
                id="messageInput"
                rows="4" 
                className="messageInput" 
                autoFocus 
                placeholder="Enter Your Message" 
                >
                </textarea>
              </form>
            </div>
          </div>
          <div className="col">
            <div className="profile">
              <p style={{color: color}} className="profile__name">{name}</p>
            </div>
          </div>
        </div>

        <button className="button-scroll-down" onClick={forceScrollMessagesToBottom}></button>
      </div>
    </div>
  );
}

export default App;
