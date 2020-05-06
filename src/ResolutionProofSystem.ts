import { unification } from './Unification.js';
import { substitutionApply, Substitution } from './Substitution.js';
import { ProofSystem, RuleOutput } from "./ProofSystem.js";
import { Formula, FormulaUtility, getDirectSubFormulas, stringToFormula, formulaToLaTeX, FormulaConstruction } from "./Formula.js";
import * as Utils from "./Utils.js";
import * as UnitTest from "./UnitTest.js";



/**
 * the main class of the proof system that is used by the system
 */
export class ResolutionProofSystem extends ProofSystem {
    constructor() {
        super();
        this.addRule1(contraction);
        this.addRule2(resolution);
    }
}



type ClashingLitteralsInfo = { litteral1: FormulaConstruction, litteral2: FormulaConstruction, mgu: Substitution };

/**
 * 
 * @param c0 a clause as an array of litterals
 * @param c1 a clause as an array of litterals
 * @returns an array of "clashing litterals"
 */
function getClashingLitterals(c0: FormulaConstruction[], c1: FormulaConstruction[]): ClashingLitteralsInfo[] {
    let clashingLitterals: ClashingLitteralsInfo[] = [];
    for (let l0 of c0)
        for (let l1 of c1) {
            if (l1.type == "not") {
                const mgu = unification(l0, FormulaUtility.getNotSub(l1));
                if (mgu) clashingLitterals.push({ litteral1: l0, litteral2: l1, mgu: mgu });
            }
            if (l0.type == "not") {
                const mgu = unification(l1, FormulaUtility.getNotSub(l0));
                if (mgu) clashingLitterals.push({ litteral1: l0, litteral2: l1, mgu: mgu });
            }
        }
    return clashingLitterals;
}



UnitTest.run("clashing lit P(x) and not P(x)", getClashingLitterals([<FormulaConstruction>stringToFormula("P(x)")], [<FormulaConstruction>stringToFormula("not P(x)")]));
UnitTest.run("clashing lit P(x) and not P(a)", getClashingLitterals([<FormulaConstruction>stringToFormula("P(x)")], [<FormulaConstruction>stringToFormula("not P(a)")]));


UnitTest.run("clashing lit q and not q",
    getClashingLitterals([<FormulaConstruction>stringToFormula("q")],
        [<FormulaConstruction>stringToFormula("not q")]));
UnitTest.run("clashing lit not p or q and not p or not q",
    getClashingLitterals([<FormulaConstruction>stringToFormula("not p"), <FormulaConstruction>stringToFormula("q")],
        [<FormulaConstruction>stringToFormula("not p"), <FormulaConstruction>stringToFormula("not q")]));
UnitTest.run("clashing lit resolution 2",
    getClashingLitterals([<FormulaConstruction> getFormulaWithNewNames(stringToFormula("not Q(y,x)")), <FormulaConstruction> getFormulaWithNewNames(stringToFormula("R(y)"))],
        [<FormulaConstruction>stringToFormula("not R(y)"), <FormulaConstruction>stringToFormula("not Q(y,x)")]));

/**
 * 
 * @param clause1 
 * @param clause2 
 * @param clashingLitterals 
 */
function getResolvant(clause1: FormulaConstruction[], clause2: FormulaConstruction[], clashingLitterals: ClashingLitteralsInfo) {
    const resolvant = [];

    for (const l of clause1) if (!Utils.same(l, clashingLitterals.litteral1)) 
        Utils.setAdd(resolvant, substitutionApply(l, clashingLitterals.mgu));

    for (const l of clause2) if (!Utils.same(l, clashingLitterals.litteral2))
        Utils.setAdd(resolvant, substitutionApply(l, clashingLitterals.mgu));

    return resolvant;
}


UnitTest.run("getResolvant P(x) and not P(x)",
    getResolvant([<FormulaConstruction>stringToFormula("P(x)")], [<FormulaConstruction>stringToFormula("not P(x)")],
        { litteral1: <FormulaConstruction> stringToFormula("P(x)"), litteral2: <FormulaConstruction> stringToFormula("not P(x)"), mgu: { "x": "x" } }));

UnitTest.run("getResolvant lit q and not p or not q",
    Utils.same(stringToFormula("not p"), getResolvant([<FormulaConstruction>stringToFormula("q")],
        [<FormulaConstruction>stringToFormula("not p"), <FormulaConstruction>stringToFormula("not q")],
        { litteral1: <FormulaConstruction> stringToFormula("q"), litteral2: <FormulaConstruction> stringToFormula("not q"), mgu: {} })));


UnitTest.run("getResolvant lit not p or q and not p or not q",
    getResolvant([<FormulaConstruction>stringToFormula("not p"), <FormulaConstruction>stringToFormula("q")],
        [<FormulaConstruction>stringToFormula("not p"), <FormulaConstruction>stringToFormula("not q")],
        { litteral1: <FormulaConstruction>stringToFormula("q"), litteral2: <FormulaConstruction>stringToFormula("not q"), mgu: {} }));

UnitTest.run("getResolvant hard resolution 2",
    getResolvant([<FormulaConstruction>stringToFormula("not Q(y,x)"), <FormulaConstruction>stringToFormula("R(y)")],
        [<FormulaConstruction>stringToFormula("not R(y)"), <FormulaConstruction>stringToFormula("not Q(y,x)")],
        { litteral1: <FormulaConstruction>stringToFormula("R(y)"), litteral2: <FormulaConstruction>stringToFormula("not R(y)"), mgu: { "y": "y" } }).map((f) =>
            formulaToLaTeX(f)).join(" or "));

/**
 * 
 * @param a formula f 
 * @return a copy of f in which variables (e.g. x, y, etc.) have been renamed (e.g. x', y', etc.)
 */
function getFormulaWithNewNames(f) {
    if (FormulaUtility.isVariable(f))
        return f + "'";
    else {
        return {type: f.type,
             pred: f.pred, func: f.func,
              args: f.args.map((a) => getFormulaWithNewNames(a))};
    }
}

UnitTest.run("getFormulaWithNewNames(p)", getFormulaWithNewNames(stringToFormula("p")));
UnitTest.run("getFormulaWithNewNames(P(x))", getFormulaWithNewNames(stringToFormula("P(x)")));
UnitTest.run("getFormulaWithNewNames(not Q(y,x))", getFormulaWithNewNames(stringToFormula("not Q(y,x)")));

/**
 * 
 * @param f 
 * @param g 
 * @returns true if f and g are the same expressions modulo variable renaming
 */
function sameModuloVariableRenaming(f, g) {
    function sameModuloVariableRenaming2(f, g, renaming) {
        if (FormulaUtility.isVariable(f)) {
            if (!FormulaUtility.isVariable(g)) throw "aïe, not a variable on the other side";
            if (renaming[f] && renaming[f] != g) throw "aïe, not a good correspondence";
            renaming[f] = g;
            return renaming;
        }
        else if (f instanceof Array) {
            if (!(g instanceof Array)) throw "aïe, not an array";

            if (f.length != g.length)
                throw "pattern matching error because not the same number of arguments";

            for (const i in f)
                renaming = sameModuloVariableRenaming2(f[i], g[i], renaming);
            
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
            for (let i in f.args)
                renaming = sameModuloVariableRenaming2(f.args[i], g.args[i], renaming);
            
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







/**********************************RESOLUTION  */

/**
 * 
 * @param aClause1 
 * @param aClause2 
 * @param aPotentialResolvant 
 * @returns the output explains that aPotentialResolvant is a resolvant of aClause1 and aClause2, or 
 * explains that it is not the case
 */
function resolution(aClause1: Formula, aClause2: Formula, aPotentialResolvant: Formula): RuleOutput {
    if (aClause1 == undefined) return ProofSystem.defaultRuleSuccess();
    if (aClause2 == undefined) return ProofSystem.defaultRuleSuccess();
    if (aPotentialResolvant == undefined) return ProofSystem.defaultRuleSuccess();

    aClause2 = <any>getFormulaWithNewNames(aClause2);
    const clause1: FormulaConstruction[] = <FormulaConstruction[]>getDirectSubFormulas(aClause1);
    const clause2: FormulaConstruction[] = <FormulaConstruction[]>getDirectSubFormulas(aClause2);
    const potentialResolvant: Formula[] = getDirectSubFormulas(aPotentialResolvant);

    const clashingLitterals = getClashingLitterals(clause1, clause2);

    for (const clashingLiteral of clashingLitterals) {

        const resolvant = getResolvant(clause1, clause2, clashingLiteral);
        /* console.log(JSON.stringify(clashingLiteral));
         console.log(JSON.stringify(res));
         console.log(JSON.stringify(resolvant));*/
        if (sameModuloVariableRenaming(resolvant, potentialResolvant))
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



/**************************************** CONTRACTION ************************************/

/**
 * 
 * @param clause 
 * @returns the set of possible contractions
 */
function getPossibleContractions(clause: FormulaConstruction[]): FormulaConstruction[][] {
    let contractions = [];
    for (const i in clause)
        for (const j in clause) if (i < j) {
            let mgu = unification(clause[i], clause[j]);
            if (mgu) contractions.push(getContractedClause(clause, mgu));
        }
    return contractions;
}



UnitTest.run("contractionPossible of P(x) P(a)",
    getPossibleContractions([<FormulaConstruction> stringToFormula("P(x)"), <FormulaConstruction> stringToFormula("P(a)")]));


/**
 * 
 * @param clause 
 * @param mgu 
 * @returns the contracted clause obtained from the clause and the mgu
 */
function getContractedClause(clause: FormulaConstruction[], mgu: Substitution): FormulaConstruction[] {
    const contractedClause = [];
    for (const l of clause) {
        const nl = substitutionApply(l, mgu);
        if (!Utils.contains(contractedClause, nl)) contractedClause.push(nl);
    }

    return contractedClause;
}


/**
 * 
 * @param clause 
 * @param potentialContractedClause 
 * tests whether potentialContractedClause is obtained from clause by the contraction rule
 */
function contraction(clause: Formula, potentialContractedClause: Formula): RuleOutput {
    if (clause == undefined) return ProofSystem.defaultRuleSuccess();
    if (potentialContractedClause == undefined) return ProofSystem.defaultRuleSuccess();
    const c0: FormulaConstruction[] = <FormulaConstruction[]> getDirectSubFormulas(clause);
    const c1: FormulaConstruction[] = <FormulaConstruction[]> getDirectSubFormulas(potentialContractedClause);

    for (const contraction of getPossibleContractions(c0)) {
        if (sameModuloVariableRenaming(contraction, c1)) return ProofSystem.ruleSuccess("contraction");
    }

    return false;
}