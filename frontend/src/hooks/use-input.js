import { useState, useCallback } from 'react';

function useInput(validityFn) {
    const [value, setValue] = useState('');
    const [isInputTouched, setIsInputTouched] = useState(false);

    const [isValid, message] = typeof validityFn === 'function' ? validityFn(value) : [true, null];
    const isInputValid = isValid || !isInputTouched;

    const inputChangeHandler = useCallback(event => {
        setValue(event.target.value);

        if(isValid && !isInputTouched) {
            setIsInputTouched(true);
        }
    }, [isValid, isInputTouched]);

    const inputBlurHandler = useCallback(() => {
        setIsInputTouched(true);
    }, []);

    const reset = useCallback(() => {
        setValue('');
        setIsInputTouched(false);
    }, []);

    return {
        value,
        isValid,
        isInputValid,
        message,
        inputChangeHandler,
        inputBlurHandler,
        reset
    };
}

export default useInput;