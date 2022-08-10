const privateMessage = (targetId) => {
    if (!targetId) {
        console.error(`invalid targetId ${targetId}`);
        return;
    };
    let textarea = document.querySelector("textarea");
    textarea.value = `@${targetId} ${textarea.value}`;
}

const MessageButton = (props) => {
    let targetId = props.socketid;
    return (
        <button className="message_button" onClick={() => privateMessage(targetId)}>PM</button>
    )
}

export default MessageButton;