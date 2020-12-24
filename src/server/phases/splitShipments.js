import cache from '../cache.js'
import groupBy from '../utils/groupBy.js'
import objects from '../objects.js'
import executeQuery from '../sql/executeQuery.js'

const splitShipments = async () => {
    if (cache.receivingTable === undefined) {
        cache.receivingTable = await executeQuery('readTable', undefined, 'in_caseType');
        console.log(cache.receivingTable[0]);
        console.log(`Table in_caseType has been read`);
    }
    let svgUpdate = [];
    const todayReceipts = cache.receivingTable.filter((item) => item.date === cache.thisDte.date);
    const length = todayReceipts.length;

    svgUpdate.push({ id: 'phase_1_total', value: length });
    return svgUpdate;

}

export default splitShipments;