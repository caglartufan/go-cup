import './Button.scss';

const Button = (props) => {
    const classes = ['button'];

    if(props.className) {
        classes.push(props.className);
    }

    return (
        <button
            type={props.type || 'button'}
            className={classes.join(' ')}
            onClick={props.onClick}
        >
            {props.children}
        </button>
    );
}

export default Button;