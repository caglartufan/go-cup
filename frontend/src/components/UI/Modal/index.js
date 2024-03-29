import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

import Card from '../Card';
import Button from '../Button';

import './style.scss';

const Modal = props => {
    const {
        title,
        children: content,
        buttons,
        onDismiss
    } = props;

    return (
        <>
            <Card box-shadow="heavy" className="modal">
                {title && (
                    <div className="modal-header">
                        <h3 className="modal-header__heading">
                            {title}
                        </h3>
                        <button className="modal__close-button" onClick={onDismiss}>
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
                                <Button onClick={onDismiss}>
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