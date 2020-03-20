import { ProofSystem } from "./ProofSystem.js";
import { Formula, getDirectSubFormulas } from "./Formula.js";

function same(obj1, obj2) {
    return JSON.stringify(obj1) == JSON.stringify(obj2);
}



function contains(element: any, array: any[]): boolean {
    for (let e of array) {
        if (same(e, element)) {
            return true;
        }
    }
    return false;
}




function resolution(ac0: Formula, ac1: Formula, ares: Formula) {
    let c0: Formula[] = getDirectSubFormulas(ac0);
    let c1: Formula[] = getDirectSubFormulas(ac1);
    let res: Formula[] = getDirectSubFormulas(ares);

    for (let l of res)
        if (!contains(l, c0) && !contains(l, c1)) return false;

    function getLit(myClause, r) {
        for (let a0 of myClause)
            if (!contains(a0, r)) {
                return a0;
            }
        return undefined;
    }

    let l0 = getLit(c0, res);
    let l1 = getLit(c1, res);

    if (l0 == undefined) return false;
    if (l1 == undefined) return false;

    for (let l of c0)
        if (!same(l, l0) && !contains(l, res))
            return false;

    for (let l of c1)
        if (!same(l, l1) && !contains(l, res))
            return false;

    if (l0.type != "not")
        [l1, l0] = [l0, l1];

    if (l0.type == "not" && l1.type == "atomic" && same(l0.arg, l1))
        return "resolution rule";

    return false;
}


export class ResolutionProofSystem extends ProofSystem {
    constructor() {
        super();
        this.addRule2(resolution);
    }
}