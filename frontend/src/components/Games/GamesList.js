import Container from '../../layout/Grid/Container';
import Row from '../../layout/Grid/Row';
import Column from '../../layout/Grid/Column';

const dummyGames = [

];

const GamesList = () => {
    return (
        <Container>
            <Row style={{ backgroundColor: 'green' }}>
                <Column size={1}>
                    1
                </Column>
            </Row>
            <Row style={{ backgroundColor: 'green' }}>
                {Array.from(new Array(2), () => <Column size={1}>1</Column>)}
            </Row>
            <Row style={{ backgroundColor: 'green' }}>
                {Array.from(new Array(4), () => <Column size={1}>1</Column>)}
            </Row>
            <Row style={{ backgroundColor: 'green' }}>
                {Array.from(new Array(3), () => <Column size={1}>1</Column>)}
            </Row>
            <Row style={{ backgroundColor: 'green' }}>
                {Array.from(new Array(4), () => <Column size={1}>1</Column>)}
            </Row>
            <Row style={{ backgroundColor: 'green' }}>
                {Array.from(new Array(5), () => <Column size={1}>1</Column>)}
            </Row>
            <Row style={{ backgroundColor: 'green' }}>
                {Array.from(new Array(6), () => <Column size={1}>1</Column>)}
            </Row>
            <Row style={{ backgroundColor: 'green' }}>
                {Array.from(new Array(7), () => <Column size={1}>1</Column>)}
            </Row>
            <Row style={{ backgroundColor: 'green' }}>
                {Array.from(new Array(8), () => <Column size={1}>1</Column>)}
            </Row>
            <Row style={{ backgroundColor: 'green' }}>
                {Array.from(new Array(9), () => <Column size={1}>1</Column>)}
            </Row>
            <Row style={{ backgroundColor: 'green' }}>
                {Array.from(new Array(10), () => <Column size={1}>1</Column>)}
            </Row>
            <Row style={{ backgroundColor: 'green' }}>
                {Array.from(new Array(11), () => <Column size={1}>1</Column>)}
            </Row>
            <Row style={{ backgroundColor: 'green' }}>
                {Array.from(new Array(12), () => <Column size={1}>1</Column>)}
            </Row>
            <Row style={{ backgroundColor: 'green' }}>
                <Column size={1}>1</Column>
                <Column size={2}>3</Column>
            </Row>
        </Container>
    );
}

export default GamesList;