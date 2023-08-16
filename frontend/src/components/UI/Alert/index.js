import Card from '../Card';

import './style.scss';

const Alert = (props) => {
    return (
        <Card className="alert" box-shadow="light" color={props.color}>
            {props.children}
        </Card>
    );
}

export default Alert;