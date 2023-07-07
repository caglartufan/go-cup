import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

import { toastActions } from '../../store/toastSlice';

import './Toast.scss';

const Toast = props => {
    const dispatch = useDispatch();
    const {
        className: customClassName,
        message,
        status,
        delay,
        ...divProps
    } = props;

    const removeToast = useCallback(() => {
        dispatch(toastActions.remove({
            message,
            status
        }));
    }, [dispatch, message, status]);

    useEffect(() => {
        if(delay !== false) {
            const timer = setTimeout(() => {
                removeToast();
            }, delay || 3000);
    
            return () => {
                clearTimeout(timer);
            };
        }
    }, [removeToast, message, status, delay]);

    let className = `toast toast--${status || 'info'}`;

    if(customClassName) {
        className = `${className} ${customClassName}`;
    }

    return (
        <div className={className} {...divProps}>
            <button className="toast__button-close" onClick={removeToast}>
                <FontAwesomeIcon icon={faXmark} />
            </button>
            {props.message}
        </div>
    );
};

export default Toast;