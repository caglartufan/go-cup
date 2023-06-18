import './Button.scss';

function Button(props) {
    const classes = ['button'];

    if(props.className) {
        classes.push(props.className);
    }

    return (
        <button className={classes.join(' ')}>
            {props.children}
        </button>
    );
}

export default Button;