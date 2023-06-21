import './Button.scss';

const Button = (props) => {
    let className = 'button';

    if(props.className) {
        className = `${className} ${props.className}`;
    }

    return (
        <button
            {...props}
            className={className}
        >
            {props.children}
        </button>
    );
}

export default Button;