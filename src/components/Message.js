const Message = (props) => {
  return (
    <div className="message">
      <p>
        <span className="message__name" style={{color: props.color}}>{props.name} </span>
        <span className="message__timestamp">{props.timestamp}</span>
      </p>
      <p className="message__content">{props.content}</p>
    </div>
  )
}

export default Message;