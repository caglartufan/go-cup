import './Column.scss';

const Column = props => {
    const {
        className: customClassName,
        size,
        ...divProps
    } = props;

    let className = 'column';
    
    if(size && size !== 1) {
        className = `${className} column--${size}`;
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

export default Column;