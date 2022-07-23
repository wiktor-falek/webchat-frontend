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

let id;

function App() {
  const [name, setName] = useState("Anonymous");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(socket.connected);

  const formRef = useRef(null);
  const inputRef = useRef(null);
  const messagesRef = useRef(null);

  function changeName(name) {
    socket.emit("nameChange", {
      name: name,
      id: id
    })
  }

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
      const args = content.slice(indexOfSpace + 1).split(" ");
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
        case "nick":
          changeName(args[0]);
        default:
          shouldReturn = false; 
      }
      if (shouldReturn) {
        return // prevent emitting message
      }
    }
    socket.emit("message", {
      content: content,
      id: id
    });
  }
  

  function scrollMessagesToBottom(e, scrollTopBefore) {
    const el = messagesRef.current;
    console.table({
      "el.scrollHeight": el.scrollHeight,
      "el.scrollTop": el.scrollTop,
      "el.clientHeight": el.clientHeight,
      "scrollPosition": el.scrollHeight - el.scrollTop - el.clientHeight,
      "scrollTopBefore": scrollTopBefore
    })

    // window.innerHeight + window.scrollY >= document.body.offsetHeight)
    if (el.scrollHeight - el.scrollTop - el.clientHeight <= 5) {
      el.scrollTop = el.scrollHeight;
    }
  }

  function forceScrollMessagesToBottom(e) {
    const el = messagesRef.current;
    //el.scrollTop = el.scrollHeight;
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
      const [left, right] = data.joinMessage.split('{{name}}');
      
      const content = left + data.who + right;

      const messageData = {
        name: data.name,
        color: data.color,
        timestamp: data.timestamp,
        content: content,
      }

      setMessages(arr => [...arr, messageData]);
    });

    socket.on('nameChange', (newName) => {
      setName(newName);
      console.log(newName);
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
                  />
              ))}
            </div>
          </div>
          <div className="col">
            <div className="online">
              <p className="online-counter">Online: {onlineUsers.length}</p>
              <div className="users">
                {onlineUsers.map((user, i) => (
                  <p className="user" key={i} socketid={user.socketid} name={user.name}>{user.name}</p>
                ))}
              </div>

            </div>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <div className="input">
              <form id="form" ref={formRef}>
                <textarea onKeyDown={handleTextAreaKeyPresses} ref={inputRef} id="messageInput" rows="4" className="messageInput" autoFocus placeholder="Enter Your Message&#10;/help to show commands"></textarea>
              </form>
            </div>
          </div>
          <div className="col">
            <div className="profile">
              <p>{name}</p>
            </div>
          </div>
        </div>

        <button className="button-scroll-down" onClick={forceScrollMessagesToBottom}></button>
      </div>
    </div>
  );
}

export default App;
