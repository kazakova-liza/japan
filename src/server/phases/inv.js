import cache from '../cache.js';




class whsLocTypeSum {
    constructor() {
        this.qty = 0
        this.cases = 0
        this.locations = 0
    }
}
class whsSum {
    constructor() {
        this.qtr = new whsLocTypeSum()
        this.hlf = new whsLocTypeSum()
        this.full = new whsLocTypeSum()
    }
}
class whsSumSimple {
    constructor() {
        this.all = new whsLocTypeSum()
    }
}
class skuSum {
    constructor() {
        this.old = new whsSum()
        this.new = new whsSum()
        this.shuttle = new whsSumSimple()
        this.resid = new whsSumSimple()
        this.all = new whsLocTypeSum()
    }
}

class invClass {
    constructor() {
        this.map = {}
    }
    putAway(sku, cases, qty, locType, whs) {
        var inv = {}
        inv.sku = sku
        inv.qty = qty
        inv.cases = cases
        if(cache.thisDte == undefined){
            inv.dteCreate = '20000101'
        }else{
            inv.dteCreate = cache.thisDte.date
        }
        inv.whs = whs
        inv.locType = locType
        if (!(sku in this.map)) {
            this.map[sku] = {}
            this.map[sku].sum = new skuSum()
            this.map[sku].locs = []
        }
        this.map[sku].locs.push(inv)
        this.updateSku(sku)
    }

    retrieve(thisSku, thisQty, thisCaseQty) {

        //if (thisSku == '38648-CHOC-5'){
        //    console.log("aaarg")
        //}

        if (!(thisSku in cache.inv.map)) {
            cache.needInv.push({ "sku": thisSku, "qty": thisQty, "standardCaseQty": thisCaseQty })
            console.log("NO INVENTORY RECORD")
        } else {
            let invRec = cache.inv.map[thisSku]
            if (invRec.sum.all.qty < thisQty) {
                cache.needInv.push({ "sku": thisSku, "qty": thisQty, "standardCaseQty": thisCaseQty })
                console.log("NOT ENOUGH INVENTORY")
            } else {
                let startInv = invRec.sum.all.qty
                let moves = []
                let units = thisQty % thisCaseQty
                let cases = Math.floor(thisQty / thisCaseQty)
                //PROCESS RESIDUALS
                if (units > 0) {
                    let residRec = invRec.locs.findIndex(element => element.whs == 'resid')
                    if (residRec == -1) {
                        this.putAway(thisSku, 1, 0, 'all', 'resid')//Starts with 0 to get moves correct
                        residRec = invRec.locs.findIndex(element => element.whs == 'resid')
                    }
                    if (invRec.locs[residRec].qty > units) {
                        invRec.locs[residRec].qty -= units
                        moves.push('residOut')
                        moves.push('residIn')
                    } else if (invRec.locs[residRec].qty == units) {
                        invRec.locs.splice(residRec, 1)
                        moves.push('residOut')
                    }
                    else { //insufficient
                        cases++
                        invRec.locs[residRec].qty = invRec.locs[residRec].qty + thisCaseQty - units
                        moves.push('residOut') // WRONG depends on if these was any in resid before
                        moves.push('residIn') 
                    }
                }
                //PROCESS SHUTTLE

                //PROCESS  CASES
                if (cases > 0){    
                    invRec.locs.sort( (p, p2) => {return p.qty - p2.qty; });
                    for (let i = 0; i < invRec.locs.length; i++) {
                        if(invRec.locs[i].whs !== 'resid' && invRec.locs[i].whs !== 'shuttle'){
                            let takeCases = Math.min(cases, invRec.locs[i].cases)
                            let takeQty = takeCases * thisCaseQty
                            cases -= takeCases
                            invRec.locs[i].cases -= takeCases
                            invRec.locs[i].qty -= takeQty
                            if (invRec.locs[i].qty <= 0){
                                invRec.locs.splice(i, 1)
                                i--  // because a record was deleted
                            }
                            if (cases == 0) break
                        }
                    }
                }
                this.updateSku(thisSku)
                let endInv = invRec.sum.all.qty
                if (startInv - thisQty !== endInv){
                    console.log("Inv prob on pick")
                }
                
            }
        }
    }

    updateSku(thisSku) {

        let sr = this.map[thisSku]
        sr.sum = new skuSum()
        sr.locs.forEach((rec) => {
            sr.sum[rec.whs][rec.locType].qty += rec.qty
            sr.sum[rec.whs][rec.locType].cases += rec.cases
            sr.sum[rec.whs][rec.locType].locations++

            sr.sum.all.qty += rec.qty
            sr.sum.all.cases += rec.cases
            sr.sum.all.locations++
        })
        //if (thisSku == '12365W-GRY-10') console.log(this.map[thisSku])
    }
    report() {
        let svgArr = []
        let res = new skuSum()
        let stats = {"when":"invRep","qty":0, "cases":0, "locations":0, "skus":0}
        Object.values(this.map).forEach((ss) => {
            res.old.qtr.locations += ss.sum.old.qtr.locations
            res.old.hlf.locations += ss.sum.old.hlf.locations
            res.old.full.locations += ss.sum.old.full.locations
            res.new.qtr.locations += ss.sum.new.qtr.locations
            res.new.hlf.locations += ss.sum.new.hlf.locations
            res.new.full.locations += ss.sum.new.full.locations
            res.shuttle.all.locations += ss.sum.shuttle.all.locations
            res.resid.all.locations += ss.sum.resid.all.locations

            stats.qty += ss.sum.all.qty
            stats.cases += ss.sum.all.cases
            stats.skus += 1
            stats.locations += ss.sum.all.locations
        })

        svgArr.push({ id: 'phase_3_new_qtr', value: res.new.qtr.locations });
        svgArr.push({ id: 'phase_3_new_hlf', value: res.new.hlf.locations });
        svgArr.push({ id: 'phase_3_new_full', value: res.new.full.locations });
        svgArr.push({ id: 'phase_3_new_shuttle', value: res.shuttle.all.locations });
        svgArr.push({ id: 'phase_3_old_qtr', value: res.old.qtr.locations });
        svgArr.push({ id: 'phase_3_old_hlf', value: res.old.hlf.locations });
        svgArr.push({ id: 'phase_3_old_full', value: res.old.full.locations });
        svgArr.push({ id: 'phase_3_old_resid', value: res.resid.all.locations });
        console.log(stats)
        return ({"svg":svgArr, "stats":stats})
    }
}

export default invClass;