import './style.scss';

const Card = (props) => {
    const {
        color,
        border,
        'box-shadow': boxShadow,
        className: customClassName,
        ...divProps
    } = props;

    let className = 'card';

    if(color && ['info', 'success', 'warning', 'danger'].includes(color)) {
        className = `${className} card--${color}`;
    }

    if(boxShadow && ['light', 'medium', 'heavy'].includes(boxShadow)) {
        className = `${className} card--shadow-${boxShadow}`;
    }

    if(border) {
        className = `${className} card--border`;
    }

    if(customClassName) {
        className = `${className} ${customClassName}`;
    }

    return (
        <div {...divProps} className={className}>
            {props.children}
        </div>
    );
}

export default Card;