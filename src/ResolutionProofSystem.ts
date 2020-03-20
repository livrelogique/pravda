import { ProofSystem } from "./ProofSystem.js";
import { Formula, FormulaUtility, getDirectSubFormulas } from "./Formula.js";
import * as Utils from "./Utils.js";

export class ResolutionProofSystem extends ProofSystem {
    constructor() {
        super();
        this.addRule2(resolution);
    }
}



function resolution(ac0: Formula, ac1: Formula, ares: Formula) {
    let c0: Formula[] = getDirectSubFormulas(ac0);
    let c1: Formula[] = getDirectSubFormulas(ac1);
    let res: Formula[] = getDirectSubFormulas(ares);

    for (let l of res)
        if (!Utils.contains(l, c0) && !Utils.contains(l, c1)) return false;

    function getLit(myClause, r) {
        for (let a0 of myClause)
            if (!Utils.contains(a0, r)) {
                return a0;
            }
        return undefined;
    }

    let l0 = getLit(c0, res);
    let l1 = getLit(c1, res);

    if (l0 == undefined) return false;
    if (l1 == undefined) return false;

    for (let l of c0)
        if (!Utils.same(l, l0) && !Utils.contains(l, res))
            return false;

    for (let l of c1)
        if (!Utils.same(l, l1) && !Utils.contains(l, res))
            return false;

    if (l0.type != "not")
        [l1, l0] = [l0, l1];

    if (l0.type == "not" && l1.type == "atomic" && Utils.same(FormulaUtility.getNotSub(l0), l1))
        return "resolution rule";

    return false;
}


