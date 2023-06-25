import './Row.scss';

const Row = props => {
    const {
        className: customClassName,
        ...divProps
    } = props;

    let className = 'row';

    if(customClassName) {
        className = `${className} ${customClassName}`;
    }

    return (
        <div {...divProps} className={className}>
            {props.children}
        </div>
    );
};

export default Row;