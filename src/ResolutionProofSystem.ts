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
        this.addRule1(contraction);
        this.addRule2(resolution);
    }
}


function isVariable(t) {
    return (typeof t == "string");
}

unitTest("isVariable(x)", isVariable("x"));
unitTest("isVariable(P(x))", !isVariable(stringToFormula("P(x)")));


type UnificationEquation = { term1: any, term2: any };

function unification2(E: UnificationEquation[], sub: {}) {
    /*console.log(JSON.stringify(E));
    console.log(JSON.stringify(sub));*/

    if (E.length == 0) return sub;

    let equation = E.pop();

    let t = equation.term1;
    let u = equation.term2;

    if (isVariable(t)) {
        sub[t] = u;
        E = E.map((eq) => ({
            term1: substitutionApply(eq.term1, sub),
            term2: substitutionApply(eq.term2, sub)
        }));

        for (let x in sub) {
            sub[x] = substitutionApply(sub[x], sub);
        }

        return unification2(E, sub);
    }

    else if (isVariable(u)) {
        E.push({ term1: u, term2: t });
        return unification2(E, sub);
    }
    else {
        if (t.type != u.type) throw "different type";
        switch (t.type) {
            case "atomic": if (t.pred != u.pred) throw "different pred";
            case "term": if (t.func != u.func) throw "different func";
        }

        if (t.args.length != u.args.length) throw "different number of args";

        for (let i in t.args) {
            E.push({ term1: t.args[i], term2: u.args[i] });
        }
        return unification2(E, sub);
    }


}



function unification(t, u) {
    try {
        return unification2([{ term1: t, term2: u }], {});
    }
    catch (e) {
        return null;
    }

}

unitTest("unifying p and p", unification(stringToFormula("p"), stringToFormula("p")) != null);
unitTest("unifying P(x) and P(x)", unification(stringToFormula("P(x)"), stringToFormula("P(x)")) != null);
unitTest("unifying P(x) and P(a)", unification(stringToFormula("P(x)"), stringToFormula("P(a)")));
unitTest("unifyfing R(z, z) and R(u, f(y))",
    unification(stringToFormula("R(z,z)"), stringToFormula("R(u, f(y))")));


function getClashingLitterals(c0, c1) {
    let clashingLitterals = [];
    for (let l0 of c0)
        for (let l1 of c1) {
            if (l1.type == "not") {
                let mgu = unification(l0, FormulaUtility.getNotSub(l1));
                if (mgu) clashingLitterals.push({ l0: l0, l1: l1, mgu: mgu });
            }   
            if (l0.type == "not") {
                let mgu = unification(l1, FormulaUtility.getNotSub(l0));
                if (mgu) clashingLitterals.push({ l0: l0, l1: l1, mgu: mgu });
            }
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




function getContractionPossible(c0) {
    let contractions = [];
    for (let i in c0)
        for (let j in c0) if (i < j) {
            console.log(c0[i]);
            console.log(c0[j]);
            let mgu = unification(c0[i], c0[j]);
            if(mgu)
                contractions.push(getContractedClause(c0, mgu));
        }
    return contractions;
}

unitTest("contractionPossible of P(x) P(a)", getContractionPossible([stringToFormula("P(x)"), stringToFormula("P(a)")]));

function getContractedClause(c0, mgu) {
    let c = [];
    for(let l of c0) {
        const nl = substitutionApply(l, mgu);
        if(!Utils.contains(nl, c)) c.push(nl);
    }

    return c;
}


//to be implemented
function contraction(f: Formula, g: Formula) {
    let c0: Formula[] = getDirectSubFormulas(f);
    let c1: Formula[] = getDirectSubFormulas(g);


    for(let c of getContractionPossible(c0)) {
        if(Utils.same(c, c1)) return "contraction";
    }

    return false;
}