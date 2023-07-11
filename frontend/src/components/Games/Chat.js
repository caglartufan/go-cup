import { useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleChevronRight } from '@fortawesome/free-solid-svg-icons';

import Card from '../UI/Card';

import './Chat.scss';

const Chat = props => {
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

        // Submit the message
        console.log(textareaRef.current.value.trim());
    }, []);

    return (
        <Card box-shadow="light" className="chat">
            <div className="chat-messages">
                <p className="chat-messages__message chat-messages__message--info">
                    Beginning of the chat <span className="chat-messages__time">(22:18)</span>
                </p>
                <p className="chat-messages__message">
                    <Link className="chat-messages__user">
                        n3pixe (530)
                    </Link>: lorem ipsum message <span className="chat-messages__time">(22:19)</span>
                </p>
                <p className="chat-messages__message">
                    <span className="chat-messages__user">n3pix (500)</span>: lorem ipsum message  <span className="chat-messages__time">(22:21)</span>
                </p>
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