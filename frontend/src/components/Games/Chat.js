import { Link } from 'react-router-dom';

import Card from '../UI/Card';

import './Chat.scss';

const Chat = props => {
    return (
        <Card box-shadow="light" className="chat">
            <div className="chat-messages">
                <p className="chat-messages__message">
                    Beginning of the chat
                </p>
                <p className="chat-messages__message">
                    <Link className="chat-messages__user-link">
                        n3pixe (530)
                    </Link>: lorem ipsum message
                </p>
                <p className="chat-messages__message">
                    n3pix (500): lorem ipsum message
                </p>
            </div>
            <div className="chat__controls">
                <form className="chat__form">
                    <textarea className="chat__textarea"></textarea>
                    <button className="chat__button-send">
                        Send
                    </button>
                </form>
            </div>
        </Card>
    );
};

export default Chat;