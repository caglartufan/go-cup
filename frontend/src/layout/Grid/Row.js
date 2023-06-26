const Row = props => {
    const {
        className: customClassName,
        columns,
        ...divProps
    } = props;

    let className = 'row';

    if(columns) {
        className = `${className} row--cols-${columns}`;
    }

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