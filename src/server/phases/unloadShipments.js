import cache from '../cache.js';
import groupBy from '../utils/groupBy.js'

const unloadShipments = () => {
    let newPals = {"old":0, "new":0}
    let stats = {"when":"unload","qty":0, "cases":0, "locations":0, "skus":0}
    cache.todayReceipts.forEach((rc) => {
        const thisCont = cache.containers.find(k => k.shipment==rc.shipment)
        let casesPerPal = Math.ceil(rc.cases / rc.pallQty)
        let fullPals = Math.floor(rc.cases/ casesPerPal)
        let partPalCases = rc.cases - ( fullPals * casesPerPal)
        for(var i = 0; i < fullPals; i++){
            cache.inv.putAway(rc.sku, casesPerPal, casesPerPal * rc.standardCaseQty, rc.pallType, thisCont.whse)
            newPals[thisCont.whse]++
        }
        if (partPalCases > 0){
            cache.inv.putAway(rc.sku, partPalCases, partPalCases * rc.standardCaseQty, rc.pallType, thisCont.whse)
            newPals[thisCont.whse]++
        }
        stats.qty += rc.qty
        stats.cases += rc.cases
        stats.skus += 1
        stats.locations += rc.pallQty
    });
    
    console.log(stats)
    const res = cache.inv.report()
    let svgUpdate = res.svg
    svgUpdate.push({ id: 'phase_2_new', value: newPals.new});
    svgUpdate.push({ id: 'phase_2_old', value: newPals.old});
    
    return svgUpdate;
}

export default unloadShipments;