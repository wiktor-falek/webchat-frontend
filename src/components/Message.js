const Message = (props) => {
  return (
    <div className="message">
      <p>
        <span className="message__name" socketid={props.socketid} style={{color: props.color}}>{props.name} </span>
        <span className="message__timestamp">{props.timestamp}</span>
      </p>
      <p className="message__content">{props.content}</p>
      <div className="message__menu">
      {!props.isservermessage && <button></button>}
      </div>
    </div>
  )
}

export default Message;