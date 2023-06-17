import Input from './Input';

import './FormGroup.scss';

function FormGroup(props) {
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
        </div>
    );
}

export default FormGroup;