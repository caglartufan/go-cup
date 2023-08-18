import './style.scss';

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
                        columnId => {
                            const columnData = columns[columnId];
                            let text = '';
                            let width = '';

                            if(typeof columnData === 'object') {
                                text = columnData.text;
                                width = columnData.width;
                            } else if(typeof columnData === 'string') {
                                text = columnData;
                            }

                            return (
                                <th key={columnId} width={width || undefined}>
                                    {text}
                                </th>
                            )
                        }
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