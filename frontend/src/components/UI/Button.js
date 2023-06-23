import { forwardRef } from 'react';

import './Button.scss';

const Button = forwardRef((props, ref) => {
    const {
        className: customClassName,
        link,
        ...buttonProps
    } = props;
    let className = 'button';

    if(customClassName) {
        className = `${className} ${customClassName}`;
    }

    if(props.link) {
        className = `${className} button--link`;
    }

    return (
        <button
            ref={ref}
            {...buttonProps}
            className={className}
        >
            {props.children}
        </button>
    );
});

export default Button;