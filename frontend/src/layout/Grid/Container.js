import './Grid.scss';

const Container = props => {
    const {
        className: customClassName,
        fluid,
        fillVertically,
        ...divProps
    } = props;

    let className = 'container';

    if(fillVertically) {
        className = `${className} container--fill-vertically`;
    }

    if(fluid) {
        className = `${className} container--fluid`;
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

export default Container;