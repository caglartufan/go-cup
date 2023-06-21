import Card from './Card';

import './Alert.scss';

const Alert = (props) => {
    return (
        <Card className="alert" box-shadow="light" color={props.color}>
            {props.children}
        </Card>
    );
}

export default Alert;