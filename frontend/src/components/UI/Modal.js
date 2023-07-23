import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

import Card from './Card';

import './Modal.scss';
import Button from './Button';
import { useCallback } from 'react';

const Modal = props => {
    const {
        title,
        children: content,
        buttons
    } = props;

    const dismissHandler = useCallback(() => {

    }, []);

    return (
        <>
            <Card box-shadow="heavy" className="modal">
                {title && (
                    <div className="modal-header">
                        <h3 className="modal-header__heading">
                            {title}
                        </h3>
                        <button className="modal__close-button" onClick={dismissHandler}>
                            <FontAwesomeIcon icon={faXmark} className="modal__close-button-icon" />
                        </button>
                    </div>
                )}
                <div className="modal-body">
                    {content}
                </div>
                <div className="modal-footer">
                    <div className="modal-footer__actions">
                        {buttons?.length 
                            ? buttons.map(
                                button => {
                                    let {
                                        color,
                                        text,
                                        onClick
                                    } = button;

                                    if(!text) {
                                        return null;
                                    }

                                    color = color || 'primary';

                                    return (
                                        <Button color={color} onClick={onClick} key={color + '-' + text}>
                                            {text}
                                        </Button>
                                    );
                                }
                            )
                            : (
                                <Button onClick={dismissHandler}>
                                    Dismiss
                                </Button>
                            )
                        }
                    </div>
                </div>
            </Card>
            <div className="modal-backdrop"></div>
        </>
    );
};

export default Modal;