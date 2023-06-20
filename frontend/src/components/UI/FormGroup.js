import { useState } from 'react';

import Input from './Input';

import './FormGroup.scss';

function FormGroup(props) {
    const [message, setMessage] = useState(null);
    const [isInputValid, setIsInputValid] = useState(false);

    let className = 'form-group';

    if(props.className) {
        className = `form-group ${props.className}`;
    }

    let labelCmp = (
        <label htmlFor={props.id}>
            {props.label}
        </label>
    );

    if(props.sideLabelElement) {
        labelCmp = (
            <div className="form-label-group">
                {labelCmp}
                {props.sideLabelElement}
            </div>
        );
    }

    function isInputValidOrMessageChangeHandler(changedIsInputValid, changedMessage) {
        setIsInputValid(changedIsInputValid);
        setMessage(changedMessage);
    }

    return (
        <div className={className}>
            {labelCmp}
            <Input
                id={props.id}
                onIsInputValidOrMessageChange={isInputValidOrMessageChangeHandler}
                {...props.inputProps}
            />
            {!isInputValid && <p className="form-group__error">{message}</p>}
        </div>
    );
}

export default FormGroup;