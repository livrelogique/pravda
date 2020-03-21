import { ProofSystem } from "./ProofSystem.js";
import { Formula, FormulaUtility, getDirectSubFormulas, stringToFormula } from "./Formula.js";
import * as Utils from "./Utils.js";




function unitTest(name, e) {
    console.log("unit test " + name + ":");
    console.log(e);
}


export class ResolutionProofSystem extends ProofSystem {
    constructor() {
        super();
        this.addRule2(resolution);
    }
}


function isVariable(t) {
    return (typeof t == "string");
}

unitTest("isVariable(x)", isVariable("x"));
unitTest("isVariable(P(x))", !isVariable(stringToFormula("P(x)")));



function set(sub, v, t) {
    if (sub[v] == undefined)
        sub[v] = t;
    else {
        sub = unification2(sub[v], t, sub);
    }

    return sub;
}





function unification2(t, u, sub) {
    console.log(t, u, sub)
    if (isVariable(t)) {
        if(u == undefined) throw "bizarre";
        return set(sub, t, u);
    }
    else if (isVariable(u)) {
        return set(sub, u, t);
    }
    else {

        if (t.type != u.type) throw "different type";
        switch (t.type) {
            case "atomic": if (t.pred != u.pred) throw "different pred";
            case "term": if (t.func != u.func) throw "different func";
        }

        if (t.args.length != u.args.length) throw "different number of args";

        for (let i in t.args) {
            sub = unification2(t.args[i], u.args[i], sub);
        }

        return sub;
    }

}


function unification(t, u) {
    try {
        return unification2(t, u, {});
    }
    catch (e) {
        return null;
    }

}

unitTest("unifying P(x) and P(x)", unification(stringToFormula("P(x)"), stringToFormula("P(x)")));
unitTest("unifying P(x) and P(a)", unification(stringToFormula("P(x)"), stringToFormula("P(a)")));
unitTest("unifyfing R(z, z) and R(u, f(y))",
    unification2(stringToFormula("R(z,z)"), stringToFormula("R(u, f(y))"), {}));


function getClashingLitterals(c0, c1) {
    let clashingLitterals = [];
    for (let l0 of c0)
        for (let l1 of c1) {
            let mgu = unification(l0, FormulaUtility.getNotSub(l1));
            if (mgu) clashingLitterals.push({ l0: l0, l1: l1, mgu: mgu });
        }

    return clashingLitterals;
}





unitTest("clashing lit P(x) and not P(x)", getClashingLitterals([stringToFormula("P(x)")], [stringToFormula("not P(x)")]));
unitTest("clashing lit P(x) and not P(a)", getClashingLitterals([stringToFormula("P(x)")], [stringToFormula("not P(a)")]));


function substitutionApply(t, sub) {
    if (isVariable(t)) {
        if (sub[t] == undefined)
            return t;
        else
            return sub[t];
    }
    else {
        let n: any = {};
        n.type = t.type;
        n.pred = t.pred;
        n.func = t.func;
        n.args = [];
        for (let a of t.args) {
            n.args.push(substitutionApply(a, sub));
        }
        return n;
    }
}

unitTest("substituying  [x := a] in P(x)",
    substitutionApply(stringToFormula("P(x)"), { "x": { type: "term", func: "a", args: [] } }));


function getResolvant(c0, c1, cl) {
    let l0 = cl.l0;
    let l1 = cl.l1;
    let mgu = cl.mgu;

    let resolvant = [];

    for (let l of c0) if (!Utils.same(l, l0)) {
        resolvant.push(substitutionApply(l, mgu));
    }


    for (let l of c1) if (!Utils.same(l, l1)) {
        resolvant.push(substitutionApply(l, mgu));
    }

    return resolvant;
}


unitTest("getResolvant P(x) and not P(x)",
    getResolvant([stringToFormula("P(x)")], [stringToFormula("not P(x)")],
        { l0: stringToFormula("P(x)"), l1: stringToFormula("not P(x)"), mgu: { "x": "x" } }));




function resolution(ac0: Formula, ac1: Formula, ares: Formula) {
    let c0: Formula[] = getDirectSubFormulas(ac0);
    let c1: Formula[] = getDirectSubFormulas(ac1);
    let res: Formula[] = getDirectSubFormulas(ares);

    let clashingLitterals = getClashingLitterals(c0, c1);

    for (let cl of clashingLitterals) {
        let resolvant = getResolvant(c0, c1, cl);

        if (Utils.same(res, resolvant))
            return "resolution rule";



    }
    return undefined;
}

/*
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
*/

