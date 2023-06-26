import './Grid.scss';

const Container = props => {
    const {
        className: customClassName,
        ...divProps
    } = props;

    let className = 'container';

    if(customClassName) {
        className = `${className} ${customClassName}`;
    }

    return (
        <div {...divProps} className={className}>
            {props.children}
        </div>
    );
};

export default Container;