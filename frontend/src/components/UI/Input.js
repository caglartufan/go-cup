import { useEffect } from 'react';

import useInput from '../../hooks/use-input';

import './Input.scss';

function Input(props) {
    const {
        value,
        isValid,
        isInputValid,
        message,
        setIsInputTouched,
        inputChangeHandler,
        inputBlurHandler,
        reset
    } = useInput(props.validity);

    const {
        onIsInputValidOrMessageChange,
        onValidityChange,
        onIsInputTouched,
        onReset
    } = props;

    let className = 'form-control';

    if(!isInputValid) {
        className = `${className} form-control--invalid`;
    }

    if(props.className) {
        className = `${className} ${props.className}`;
    }

    useEffect(() => {
        if(onIsInputValidOrMessageChange && typeof onIsInputValidOrMessageChange === 'function') {
            onIsInputValidOrMessageChange(isInputValid, message);
        }
    }, [onIsInputValidOrMessageChange, isInputValid, message]);

    useEffect(() => {
        if(onValidityChange && typeof onValidityChange === 'function') {
            onValidityChange(isValid);
        }
    }, [onValidityChange, isValid]);

    useEffect(() => {
        if(onIsInputTouched && typeof onIsInputTouched === 'function') {
            onIsInputTouched(setIsInputTouched);
        }
    }, [onIsInputTouched, setIsInputTouched]);

    useEffect(() => {
        if(onReset && typeof onReset === 'function') {
            onReset(reset);
        }
    }, [onReset, reset]);

    return (
        <input
            {...props}
            className={className}
            value={value}
            onChange={inputChangeHandler}
            onBlur={inputBlurHandler}
        />
    );
}

export default Input;