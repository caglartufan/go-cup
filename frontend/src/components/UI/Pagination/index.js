import Button from '../Button';

import './style.scss';

const Pagination = props => {
    const {
        currentPage,
        totalPages,
        onPageChange
    } = props;

    return (
        <div className="pagination">
            {
                Array
                    .from(new Array(totalPages), (_, index) => (index + 1))
                    .map(page => (
                        <Button
                            key={page}
                            onClick={onPageChange.bind(null, page)}
                            disabled={currentPage === page}
                        >
                            {page}
                        </Button>
                    ))
            }
        </div>
    );
};

export default Pagination;