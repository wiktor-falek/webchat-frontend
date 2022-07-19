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

  useEffect(() => {
    socket.on('connection', () => {
      console.log('connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('disconnected');
      setIsConnected(false);
    });

    socket.on('message', (data) => {
      setMessages(arr => [...arr, data]);
    });
  });

  return (
    <div className='App'>
      <div className='main-container'>
        <div className="row">
          <div className="col">
            <div className='messages'>
              <>
              {messages.map((data, i) => (
                  <Message 
                  key={i} 
                  name={data.name} 
                  timestamp={new Date(data.timestamp).toLocaleTimeString()} 
                  color={data.color} 
                  content={data.content}
                  />
              ))}
              </>
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
              <textarea id="messageInput" class="messageInput" rows="4" placeholder="Enter Your Message"></textarea>
            </div>
          </div>
          <div className="col">
            <div className="settings">
              Settings
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
