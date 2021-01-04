const addWS = (ws, columns, data) => {
    // const ws = wbook.addWorksheet(nme);
    //Write Column Title in Excel file
    columns.forEach(col => {
        ws.cell(1, col.idx)
            .string(col.name)
    });
    let rowIndex = 2;
    data.forEach(record => {
        console.log(record);
        columns.forEach(col => {
            if (col.key in record) {
                if (col.type == "string") ws.cell(rowIndex, col.idx).string(record[col.key])
                if (col.type == "number") ws.cell(rowIndex, col.idx).number(record[col.key])
                if (col.type == "objToString") ws.cell(rowIndex, col.idx).string(record[col.key].toString())
                if (col.type == "date") ws.cell(rowIndex, col.idx).date(record[col.key]).style({ numberFormat: 'yyyy-mm-dd' })
            }
        });
        rowIndex++;
    });
}

export default addWS;