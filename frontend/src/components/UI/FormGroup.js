import { useSelector } from 'react-redux';

import Input from './Input';

import './FormGroup.scss';

const FormGroup = (props) => {
    const {
        form: formName,
        name: input
    } = props.inputProps;
    const {
        isInputValid,
        message
    } = useSelector(state => state[formName].inputs[input]);

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

    return (
        <div className={className}>
            {labelCmp}
            <Input
                id={props.id}
                {...props.inputProps}
            />
            {!isInputValid && <p className="form-group__error">{message}</p>}
        </div>
    );
}

export default FormGroup;