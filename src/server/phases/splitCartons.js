import cache from '../cache.js';
import groupBy from '../utils/groupBy.js';

const splitCartons = () => {
    const svgUpdate = [];
    // find ctns with stles not in this list
    const notEligibleLines = cache.dayOrds.filter((f) => !cache.eligibleStyleColList.includes(f.styleCol));
    console.log('notEligibleLines = ', notEligibleLines.length);
    const notEligibleCarton = notEligibleLines.map((obj) => obj.carton);
    // remove these from eligible cartons
    const eligibleCartonList = cache.possibleCtnsList.filter((f) => !notEligibleCarton.includes(f));
    console.log('eligibleCartonList = ', eligibleCartonList.length);
    // get orders for these ctns
    const keyOrdLines = cache.dayOrds.filter((f) => eligibleCartonList.includes(f.carton));
    const dataForMySQL1 = keyOrdLines.map((obj) => [obj.dte, obj.carton, obj.sku, obj.sqty]);
    cache.dataForKeyOrderLines.push(...dataForMySQL1);

    cache.activeLines = (cache.dayOrds.filter((f) => !eligibleCartonList.includes(f.carton)));
    console.log('activeLines = ', cache.activeLines.length);
    const dataForMySQL2 = cache.activeLines.map((obj) => [obj.dte, obj.carton, obj.sku, obj.sqty])
    cache.dataForActiveLines.push(...dataForMySQL2);

    if (keyOrdLines.length > 0) {
        const stats1 = groupBy(keyOrdLines, ['dte'], ['sqty'], ['carton', 'sku']);
        svgUpdate.push({ id: 'keyLines', value: stats1[0].cnt });
        svgUpdate.push({ id: 'keyCtns', value: stats1[0].carton_dcnt });
        svgUpdate.push({ id: 'keySkus', value: stats1[0].sku_dcnt });
        svgUpdate.push({ id: 'keyPairs', value: stats1[0].sqty_sum });
    } else {
        svgUpdate.push({ id: 'keyLines', value: 0 }, { id: 'keyCtns', value: 0 }, { id: 'keySkus', value: 0 }, { id: 'keyPairs', value: 0 })
    }
    if (cache.activeLines.length > 0) {
        const stats2 = groupBy(cache.activeLines, ['dte'], ['sqty'], ['carton', 'sku']);
        svgUpdate.push({ id: 'activeLines', value: stats2[0].cnt });
        svgUpdate.push({ id: 'activeCtns', value: stats2[0].carton_dcnt });
        svgUpdate.push({ id: 'activeSkus', value: stats2[0].sku_dcnt });
        svgUpdate.push({ id: 'activePairs', value: stats2[0].sqty_sum });
    } else {
        svgUpdate.push({ id: 'activeLines', value: 0 }, { id: 'activeCtns', value: 0 }, { id: 'activeSkus', value: 0 }, { id: 'activePairs', value: 0 })
    }

    return svgUpdate;
};

export default splitCartons;