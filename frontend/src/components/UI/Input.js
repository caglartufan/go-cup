import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { loginFormActions } from '../../store/loginFormSlice';

import './Input.scss';

const Input = (props) => {
    const dispatch = useDispatch();
    const {
        form: formName,
        name: input,
        onValidate,
        ...inputProps
    } = props;
    const {
        value,
        isInputTouched
    } = useSelector(state => state[formName].inputs[input]);

    const [isValid, message] = typeof onValidate === 'function' ? onValidate(value) : [true, null];
    const isInputValid = isValid || !isInputTouched;

    useEffect(() => {
        dispatch(loginFormActions.updateValidityAndMessage({ input, isValid, message }));
    }, [dispatch,  input, isValid, message]);

    let className = 'form-control';

    if(!isInputValid) {
        className = `${className} form-control--invalid`;
    }

    if(props.className) {
        className = `${className} ${props.className}`;
    }
    
    const inputChangeHandler = (event) => {
        const userInput = event.currentTarget.value;
        dispatch(loginFormActions.updateValue({ input, value: userInput }));
    };

    const inputBlurHandler = () => {
        dispatch(loginFormActions.updateIsInputTouched({ input, isInputTouched: true }));
    }

    return (
        <input
            name={input}
            {...inputProps}
            className={className}
            value={value}
            onChange={inputChangeHandler}
            onBlur={inputBlurHandler}
        />
    );
}

export default Input;