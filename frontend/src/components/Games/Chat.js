import { useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleChevronRight } from '@fortawesome/free-solid-svg-icons';
import { formatDateToHoursAndMinutes } from '../../utils/helpers';

import { socket } from '../../websocket';

import Card from '../UI/Card';

import './Chat.scss';

const Chat = props => {
    const gameId = useSelector(state => state.game.game._id);
    const chat = useSelector(state => state.game.game.chat);
    const textareaRef = useRef();
    const formRef = useRef();

    // Dynamically modify the height of textarea when new line was added
    const inputHandler = useCallback(event => {
        const textareaElement = event.target;
        textareaElement.style.height = '2.1rem'; // 1.4rem font-size, 1.5 line-height = 2.1rem
        textareaElement.style.height = `calc(${textareaElement.scrollHeight}px - 1rem)`;
    }, []);

    // To trigger form submit when Enter (only and only Enter) key is pressed
    // If Enter was pressed with Shift key, then browser automatically adds a line break
    const keyDownHandler = useCallback(event => {
        const { key, shiftKey } = event;

        if(key === 'Enter' && !shiftKey) {
            event.preventDefault();
            formRef.current.requestSubmit();
        }
    }, []);

    const submitHandler = useCallback(event => {
        event.preventDefault();

        // TODO: Make sure message is safe for XSS
        const message = textareaRef.current.value.trim();

        socket.emit('gameChatMessage', gameId, message);
    }, [gameId]);

    return (
        <Card box-shadow="light" className="chat">
            <div className="chat-messages">
                {chat.map(chatEntry => {
                    const createdAtDate = new Date(chatEntry.createdAt);

                    if(chatEntry.isSystem) {
                        return (
                            <p className="chat-messages__message chat-messages__message--info" key={createdAtDate}>
                                {chatEntry.message} <span className="chat-messages__time">({formatDateToHoursAndMinutes(createdAtDate)})</span>
                            </p>
                        );
                    } else {
                        return (
                            <p className="chat-messages__message" key={createdAtDate}>
                                <Link className="chat-messages__user" to={'/users/' + chatEntry.user.username}>{chatEntry.user.username} ({chatEntry.user.elo})</Link>: {chatEntry.message} <span className="chat-messages__time">({createdAtDate.toLocaleTimeString()})</span>
                            </p>
                        );
                    }
                })}
            </div>
            <div className="chat-controls">
                <form className="chat-controls__form" onSubmit={submitHandler} ref={formRef}>
                    <textarea
                        className="chat-controls__textarea"
                        rows={1}
                        placeholder="Enter your message..."
                        onInput={inputHandler}
                        onKeyDown={keyDownHandler}
                        ref={textareaRef}
                    ></textarea>
                    <button className="chat-controls__button">
                        <FontAwesomeIcon icon={faCircleChevronRight} />
                    </button>
                </form>
            </div>
        </Card>
    );
};

export default Chat;