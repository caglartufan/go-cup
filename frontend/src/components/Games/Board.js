import './Board.scss';

const Board = props => {
    const {
        state
    } = props;

    return (
        <canvas class="board"></canvas>
    );
};

export default Board;