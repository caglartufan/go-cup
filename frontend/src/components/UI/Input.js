import './Input.scss';

function Input(props) {
    let className = 'form-control';

    if(props.className) {
        className = `form-control ${props.className}`;
    }

    return (
        <input
            {...props}
            className={className}
        />
    );
}

export default Input;