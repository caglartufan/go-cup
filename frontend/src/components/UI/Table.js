import './Table.scss';

const Table = props => {
    const {
        columns,
        rows,
        className: customClassName,
        ...tableProps
    } = props;

    let className = 'table';

    if(customClassName) {
        className = `${className} ${customClassName}`;
    }

    return (
        <table className={className} {...tableProps}>
            <thead>
                <tr>
                    {Object.keys(columns).map(
                        columnId => (
                            <td key={columnId}>
                                {columns[columnId]}
                            </td>
                        )
                    )}
                </tr>
            </thead>
            <tbody>
                {rows.map(
                    row => (
                        <tr key={row.id}>
                            {Object.keys(row).map(
                                property => property !== 'id' && (
                                    <td key={property}>
                                        {row[property]}
                                    </td>
                                )
                            )}
                        </tr>
                    )
                )}
            </tbody>
        </table>
    );
};

export default Table;