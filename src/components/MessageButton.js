const privateMessage = (targetId) => {
    if (!targetId) {
        console.error(`invalid targetId ${targetId}`);
        return;
    };
    let textarea = document.querySelector("textarea");
    let previousValue = textarea.value;
    textarea.value = `@${targetId} ${previousValue}`
}

const MessageButton = (props) => {
    let targetId = props.socketid;
    return (
        <button className="message_button" onClick={() => privateMessage(targetId)}>PM</button>
    )
}

export default MessageButton;