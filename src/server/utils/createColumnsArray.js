
const createColumnsArray = (data) => {
    const keys = Object.keys(data);
    let counter = 0;
    const columns = keys.map((key) => {
        counter++;
        const type = typeof data[key];
        let typeForWs;
        if (type === 'number') {
            typeForWs = 'number';
        }
        if (type === 'string') {
            typeForWs = 'string';
        }
        if (type === 'string') {
            typeForWs = 'string';
        }
        if (type === 'boolean') {
            typeForWs = 'string';
        }
        if (type === 'undefined') {
            console.log(data[key]);
        }
        return {
            key,
            name: key,
            idx: counter,
            type: typeForWs
        }
    });
    return columns;
}

export default createColumnsArray;

