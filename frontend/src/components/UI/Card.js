import './Card.scss';

const Card = (props) => {
    const classes = ['card'];

    if(props.border) {
        classes.push('card--border');
    }

    return (
        <div className={classes.join(' ')}>
            {props.children}
        </div>
    );
}

export default Card;