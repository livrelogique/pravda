import { ProofSystem, RuleOutput } from "./ProofSystem.js";
import { Formula, FormulaUtility, getDirectSubFormulas, stringToFormula, formulaToString } from "./Formula.js";
import * as Utils from "./Utils.js";
import * as UnitTest from "./UnitTest.js";





export class ResolutionProofSystem extends ProofSystem {
    constructor() {
        super();
        this.addRule1(contraction);
        this.addRule2(resolution);
    }
}


function isVariable(t) { return (typeof t == "string"); }

UnitTest.run("isVariable(x)", isVariable("x"));
UnitTest.run("isVariable(P(x))", !isVariable(stringToFormula("P(x)")));


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

UnitTest.run("unifying p and p", unification(stringToFormula("p"), stringToFormula("p")) != null);
UnitTest.run("unifying P(x) and P(x)", unification(stringToFormula("P(x)"), stringToFormula("P(x)")) != null);
UnitTest.run("unifying P(x) and P(a)", unification(stringToFormula("P(x)"), stringToFormula("P(a)")));
UnitTest.run("unifyfing R(z, z) and R(u, f(y))",
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





UnitTest.run("clashing lit P(x) and not P(x)", getClashingLitterals([stringToFormula("P(x)")], [stringToFormula("not P(x)")]));
UnitTest.run("clashing lit P(x) and not P(a)", getClashingLitterals([stringToFormula("P(x)")], [stringToFormula("not P(a)")]));


UnitTest.run("clashing lit q and not q",
    getClashingLitterals([stringToFormula("q")],
        [stringToFormula("not q")]));
UnitTest.run("clashing lit not p or q and not p or not q",
    getClashingLitterals([stringToFormula("not p"), stringToFormula("q")],
        [stringToFormula("not p"), stringToFormula("not q")]));
UnitTest.run("clashing lit resolution 2",
    getClashingLitterals([getFormulaWithNewNames(stringToFormula("not Q(y,x)")), getFormulaWithNewNames(stringToFormula("R(y)"))],
        [stringToFormula("not R(y)"), stringToFormula("not Q(y,x)")]));

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
        if (t.pred) n.pred = t.pred;
        if (t.func) n.func = t.func;
        n.args = [];
        for (let a of t.args)
            n.args.push(substitutionApply(a, sub));

        return n;
    }
}

UnitTest.run("substituying  [x := a] in P(x)",
    substitutionApply(stringToFormula("P(x)"), { "x": { type: "term", func: "a", args: [] } }));
UnitTest.run("substituying  [] in P(x)",
    formulaToString(substitutionApply(stringToFormula("P(x)"), {})));
UnitTest.run("substituying  [] in Q(x,y)",
    formulaToString(substitutionApply(stringToFormula("Q(x,y)"), {})));
UnitTest.run("substituying  [x, y] in Q(x,y)",
    formulaToString(substitutionApply(stringToFormula("Q(x,y)"), { x: "x", y: "y" })));

function getResolvant(c0, c1, cl) {
    let l0 = cl.l0;
    let l1 = cl.l1;
    let mgu = cl.mgu;

    let resolvant = [];

    for (let l of c0) if (!Utils.same(l, l0)) {
        Utils.setAdd(resolvant, substitutionApply(l, mgu));
    }

    for (let l of c1) if (!Utils.same(l, l1)) {
        Utils.setAdd(resolvant, substitutionApply(l, mgu));
    }

    return resolvant;
}




UnitTest.run("getResolvant P(x) and not P(x)",
    getResolvant([stringToFormula("P(x)")], [stringToFormula("not P(x)")],
        { l0: stringToFormula("P(x)"), l1: stringToFormula("not P(x)"), mgu: { "x": "x" } }));

UnitTest.run("getResolvant lit q and not p or not q",
    Utils.same(stringToFormula("not p"), getResolvant([stringToFormula("q")],
        [stringToFormula("not p"), stringToFormula("not q")],
        { l0: stringToFormula("q"), l1: stringToFormula("not q"), mgu: {} })));


UnitTest.run("getResolvant lit not p or q and not p or not q",
    getResolvant([stringToFormula("not p"), stringToFormula("q")],
        [stringToFormula("not p"), stringToFormula("not q")],
        { l0: stringToFormula("q"), l1: stringToFormula("not q"), mgu: {} }));

UnitTest.run("getResolvant hard resolution 2",
    getResolvant([stringToFormula("not Q(y,x)"), stringToFormula("R(y)")],
        [stringToFormula("not R(y)"), stringToFormula("not Q(y,x)")],
        { l0: stringToFormula("R(y)"), l1: stringToFormula("not R(y)"), mgu: { "y": "y" } }).map((f) =>
            formulaToString(f)).join(" or "));


function getFormulaWithNewNames(f) {
    if (isVariable(f))
        return f + "'";
    else {
        let n: any = {};
        n.type = f.type;
        if (f.pred) n.pred = f.pred;
        if (f.func) n.func = f.func;
        n.args = [];
        for (let a of f.args) {
            n.args.push(getFormulaWithNewNames(a));
        }
        return n;
    }
}


UnitTest.run("getFormulaWithNewNames(p)", getFormulaWithNewNames(stringToFormula("p")));
UnitTest.run("getFormulaWithNewNames(P(x))", getFormulaWithNewNames(stringToFormula("P(x)")));
UnitTest.run("getFormulaWithNewNames(not Q(y,x))", getFormulaWithNewNames(stringToFormula("not Q(y,x)")));

function sameModuloVariableRenaming(f, g) {
    function sameModuloVariableRenaming2(f, g, renaming) {
        if (isVariable(f)) {
            if (!isVariable(g)) throw "aïe, not a variable on the other side";
            if (renaming[f] && renaming[f] != g) throw "aïe, not a good correspondence";
            renaming[f] = g;
            return renaming;
        }
        else if (f instanceof Array) {
            if (!(g instanceof Array)) throw "aïe, not an array";

            if (f.length != g.length)
                throw "pattern matching error because not the same number of arguments";

            for (let i in f) {
                renaming = sameModuloVariableRenaming2(f[i], g[i], renaming);
            }
            return renaming;
        }
        else {
            if (f.type != g.type)
                throw "pattern matching error because different type";
            if (f.type == "atomic" && (f.pred != g.pred))
                throw "pattern matching error because different pred";
            if (f.type == "term" && (f.func != g.func))
                throw "pattern matching error because different func";
            if ((f.args).length != (g.args).length)
                throw "pattern matching error because not the same number of arguments";
            for (let i in f.args) {
                renaming = sameModuloVariableRenaming2(f.args[i], g.args[i], renaming);
            }
            return renaming;
        }

    }

    try {
        return sameModuloVariableRenaming2(f, g, {});
    }
    catch (e) {
        return null;
    }

}


UnitTest.run("sameModuloVariableRenaming([], [p])",
    sameModuloVariableRenaming([], [stringToFormula("p")]));
UnitTest.run("sameModuloVariableRenaming(p, p)",
    sameModuloVariableRenaming(stringToFormula("p"), stringToFormula("p")));
UnitTest.run("sameModuloVariableRenaming(P(x), P(y))",
    sameModuloVariableRenaming(stringToFormula("P(x)"), stringToFormula("P(y)")));
UnitTest.run("sameModuloVariableRenaming(not P(x) or P(z), not P(y) or P(x))",
    sameModuloVariableRenaming(stringToFormula("not P(x) or P(z)"), stringToFormula("not P(y) or P(x)")));

UnitTest.run("sameModuloVariableRenaming(not Q(y,x), not Q(v,x))", sameModuloVariableRenaming(stringToFormula("not Q(y,x)"),
    stringToFormula("not Q(v,x)")));

UnitTest.run("sameModuloVariableRenaming(not Q(y,x), not Q(v,u))", sameModuloVariableRenaming(stringToFormula("not Q(y,x)"),
    stringToFormula("not Q(v,u)")));
UnitTest.run("sameModuloVariableRenaming(not Q(y,x), not Q(y',x'))", sameModuloVariableRenaming(stringToFormula("not Q(y,x)"),
    getFormulaWithNewNames(stringToFormula("not Q(y,x)"))));


function resolution(ac0: Formula, ac1: Formula, ares: Formula): RuleOutput {
    ac1 = <any>getFormulaWithNewNames(ac1);
    let c0: Formula[] = getDirectSubFormulas(ac0);
    let c1: Formula[] = getDirectSubFormulas(ac1);
    let res: Formula[] = getDirectSubFormulas(ares);

    let clashingLitterals = getClashingLitterals(c0, c1);

    for (let clashingLiteral of clashingLitterals) {

        let resolvant = getResolvant(c0, c1, clashingLiteral);
        /* console.log(JSON.stringify(clashingLiteral));
         console.log(JSON.stringify(res));
         console.log(JSON.stringify(resolvant));*/
        if (sameModuloVariableRenaming(res, resolvant))
            return ProofSystem.ruleSuccess("resolution");
    }
    return false;
}

UnitTest.run("resolution q and not q", resolution(stringToFormula("q"), stringToFormula("not q"), stringToFormula("bottom")));
UnitTest.run("resolution q and not p or not q", resolution(stringToFormula("q"), stringToFormula("not p or not q"), stringToFormula("not p")));
UnitTest.run("resolution q and not p or not q should not be bottom", resolution(stringToFormula("q"), stringToFormula("not p or not q"), stringToFormula("bottom")));
UnitTest.run("resolution not p or q and not p or not q", resolution(stringToFormula("not p or q"), stringToFormula("not p or not q"), stringToFormula("not p")));

UnitTest.run("hard resolution 0", resolution(stringToFormula("R(y)"),
    stringToFormula("not R(y)"),
    stringToFormula("bottom")));
UnitTest.run("hard resolution 1", resolution(stringToFormula("not Q(y) or R(y)"),
    stringToFormula("not R(y) or not Q(y)"),
    stringToFormula("not Q(y)")));
UnitTest.run("hard resolution 2", resolution(stringToFormula("not Q(y,x) or R(y)"),
    stringToFormula("not R(y) or not Q(y,x)"),
    stringToFormula("not Q(y,x)")));

UnitTest.run("hard resolution 3", resolution(stringToFormula("not P(x) or not Q(y,x) or R(y)"),
    stringToFormula("not R(y) or not P(x) or not Q(y,x)"),
    stringToFormula("not P(x) or not Q(y,x)")));



/*************** CONTRACTION */


function getContractionPossible(c0) {
    let contractions = [];
    for (let i in c0)
        for (let j in c0) if (i < j) {
            let mgu = unification(c0[i], c0[j]);
            if (mgu)
                contractions.push(getContractedClause(c0, mgu));
        }
    return contractions;
}



UnitTest.run("contractionPossible of P(x) P(a)",
    getContractionPossible([stringToFormula("P(x)"), stringToFormula("P(a)")]));



function getContractedClause(c0, mgu) {
    let c = [];
    for (let l of c0) {
        const nl = substitutionApply(l, mgu);
        if (!Utils.contains(c, nl)) c.push(nl);
    }

    return c;
}

function contraction(f: Formula, g: Formula): RuleOutput {
    let c0: Formula[] = getDirectSubFormulas(f);
    let c1: Formula[] = getDirectSubFormulas(g);

    for (let contraction of getContractionPossible(c0)) {
        if (Utils.same(contraction, c1)) return ProofSystem.ruleSuccess("contraction");
    }

    return false;
}