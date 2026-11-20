var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { unification } from './Unification.js';
import { substitutionApply } from './Substitution.js';
import { ProofSystem } from "./ProofSystem.js";
import { FormulaUtility, getDirectSubFormulas, stringToFormula, formulaToLaTeX } from "./Formula.js";
import * as Utils from "./Utils.js";
import * as UnitTest from "./UnitTest.js";
/**
 * the main class of the proof system that is used by the system
 */
var ResolutionProofSystem = /** @class */ (function (_super) {
    __extends(ResolutionProofSystem, _super);
    function ResolutionProofSystem() {
        var _this = _super.call(this) || this;
        _this.addRule1(contraction);
        _this.addRule2(resolution);
        return _this;
    }
    return ResolutionProofSystem;
}(ProofSystem));
export { ResolutionProofSystem };
/**
 *
 * @param c0 a clause as an array of litterals
 * @param c1 a clause as an array of litterals
 * @returns an array of "clashing litterals"
 */
function getClashingLitterals(c0, c1) {
    var clashingLitterals = [];
    for (var _i = 0, c0_1 = c0; _i < c0_1.length; _i++) {
        var l0 = c0_1[_i];
        for (var _a = 0, c1_1 = c1; _a < c1_1.length; _a++) {
            var l1 = c1_1[_a];
            if (l1.type == "not") {
                var mgu = unification(l0, FormulaUtility.getNotSub(l1));
                if (mgu)
                    clashingLitterals.push({ litteral1: l0, litteral2: l1, mgu: mgu });
            }
            if (l0.type == "not") {
                var mgu = unification(l1, FormulaUtility.getNotSub(l0));
                if (mgu)
                    clashingLitterals.push({ litteral1: l0, litteral2: l1, mgu: mgu });
            }
        }
    }
    return clashingLitterals;
}
UnitTest.run("clashing lit P(x) and not P(x)", getClashingLitterals([stringToFormula("P(x)")], [stringToFormula("not P(x)")]));
UnitTest.run("clashing lit P(x) and not P(a)", getClashingLitterals([stringToFormula("P(x)")], [stringToFormula("not P(a)")]));
UnitTest.run("clashing lit q and not q", getClashingLitterals([stringToFormula("q")], [stringToFormula("not q")]));
UnitTest.run("clashing lit not p or q and not p or not q", getClashingLitterals([stringToFormula("not p"), stringToFormula("q")], [stringToFormula("not p"), stringToFormula("not q")]));
UnitTest.run("clashing lit resolution 2", getClashingLitterals([getFormulaWithNewNames(stringToFormula("not Q(y,x)")), getFormulaWithNewNames(stringToFormula("R(y)"))], [stringToFormula("not R(y)"), stringToFormula("not Q(y,x)")]));
/**
 *
 * @param clause1
 * @param clause2
 * @param clashingLitterals
 */
function getResolvant(clause1, clause2, clashingLitterals) {
    var resolvant = [];
    for (var _i = 0, clause1_1 = clause1; _i < clause1_1.length; _i++) {
        var l = clause1_1[_i];
        if (!Utils.same(l, clashingLitterals.litteral1))
            Utils.setAdd(resolvant, substitutionApply(l, clashingLitterals.mgu));
    }
    for (var _a = 0, clause2_1 = clause2; _a < clause2_1.length; _a++) {
        var l = clause2_1[_a];
        if (!Utils.same(l, clashingLitterals.litteral2))
            Utils.setAdd(resolvant, substitutionApply(l, clashingLitterals.mgu));
    }
    return resolvant;
}
UnitTest.run("getResolvant P(x) and not P(x)", getResolvant([stringToFormula("P(x)")], [stringToFormula("not P(x)")], { litteral1: stringToFormula("P(x)"), litteral2: stringToFormula("not P(x)"), mgu: { "x": "x" } }));
UnitTest.run("getResolvant lit q and not p or not q", Utils.same(stringToFormula("not p"), getResolvant([stringToFormula("q")], [stringToFormula("not p"), stringToFormula("not q")], { litteral1: stringToFormula("q"), litteral2: stringToFormula("not q"), mgu: {} })));
UnitTest.run("getResolvant lit not p or q and not p or not q", getResolvant([stringToFormula("not p"), stringToFormula("q")], [stringToFormula("not p"), stringToFormula("not q")], { litteral1: stringToFormula("q"), litteral2: stringToFormula("not q"), mgu: {} }));
UnitTest.run("getResolvant hard resolution 2", getResolvant([stringToFormula("not Q(y,x)"), stringToFormula("R(y)")], [stringToFormula("not R(y)"), stringToFormula("not Q(y,x)")], { litteral1: stringToFormula("R(y)"), litteral2: stringToFormula("not R(y)"), mgu: { "y": "y" } }).map(function (f) {
    return formulaToLaTeX(f);
}).join(" or "));
/**
 *
 * @param a formula f
 * @return a copy of f in which variables (e.g. x, y, etc.) have been renamed (e.g. x', y', etc.)
 */
function getFormulaWithNewNames(f) {
    if (FormulaUtility.isVariable(f))
        return f + "'";
    else {
        return { type: f.type,
            pred: f.pred, func: f.func,
            args: f.args.map(function (a) { return getFormulaWithNewNames(a); }) };
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
            if (!FormulaUtility.isVariable(g))
                throw "aïe, not a variable on the other side";
            if (renaming[f] && renaming[f] != g)
                throw "aïe, not a good correspondence";
            renaming[f] = g;
            return renaming;
        }
        else if (f instanceof Array) {
            if (!(g instanceof Array))
                throw "aïe, not an array";
            if (f.length != g.length)
                throw "pattern matching error because not the same number of arguments";
            for (var i in f)
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
            for (var i in f.args)
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
UnitTest.run("sameModuloVariableRenaming([], [p])", sameModuloVariableRenaming([], [stringToFormula("p")]));
UnitTest.run("sameModuloVariableRenaming(p, p)", sameModuloVariableRenaming(stringToFormula("p"), stringToFormula("p")));
UnitTest.run("sameModuloVariableRenaming(P(x), P(y))", sameModuloVariableRenaming(stringToFormula("P(x)"), stringToFormula("P(y)")));
UnitTest.run("sameModuloVariableRenaming(not P(x) or P(z), not P(y) or P(x))", sameModuloVariableRenaming(stringToFormula("not P(x) or P(z)"), stringToFormula("not P(y) or P(x)")));
UnitTest.run("sameModuloVariableRenaming(not Q(y,x), not Q(v,x))", sameModuloVariableRenaming(stringToFormula("not Q(y,x)"), stringToFormula("not Q(v,x)")));
UnitTest.run("sameModuloVariableRenaming(not Q(y,x), not Q(v,u))", sameModuloVariableRenaming(stringToFormula("not Q(y,x)"), stringToFormula("not Q(v,u)")));
UnitTest.run("sameModuloVariableRenaming(not Q(y,x), not Q(y',x'))", sameModuloVariableRenaming(stringToFormula("not Q(y,x)"), getFormulaWithNewNames(stringToFormula("not Q(y,x)"))));
/**********************************RESOLUTION  */
/**
 *
 * @param aClause1
 * @param aClause2
 * @param aPotentialResolvant
 * @returns the output explains that aPotentialResolvant is a resolvant of aClause1 and aClause2, or
 * explains that it is not the case
 */
function resolution(aClause1, aClause2, aPotentialResolvant) {
    if (aClause1 == undefined)
        return ProofSystem.defaultRuleSuccess();
    if (aClause2 == undefined)
        return ProofSystem.defaultRuleSuccess();
    if (aPotentialResolvant == undefined)
        return ProofSystem.defaultRuleSuccess();
    aClause2 = getFormulaWithNewNames(aClause2);
    var clause1 = getDirectSubFormulas(aClause1);
    var clause2 = getDirectSubFormulas(aClause2);
    var potentialResolvant = getDirectSubFormulas(aPotentialResolvant);
    var clashingLitterals = getClashingLitterals(clause1, clause2);
    for (var _i = 0, clashingLitterals_1 = clashingLitterals; _i < clashingLitterals_1.length; _i++) {
        var clashingLiteral = clashingLitterals_1[_i];
        var resolvant = getResolvant(clause1, clause2, clashingLiteral);
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
UnitTest.run("hard resolution 0", resolution(stringToFormula("R(y)"), stringToFormula("not R(y)"), stringToFormula("bottom")));
UnitTest.run("hard resolution 1", resolution(stringToFormula("not Q(y) or R(y)"), stringToFormula("not R(y) or not Q(y)"), stringToFormula("not Q(y)")));
UnitTest.run("hard resolution 2", resolution(stringToFormula("not Q(y,x) or R(y)"), stringToFormula("not R(y) or not Q(y,x)"), stringToFormula("not Q(y,x)")));
UnitTest.run("hard resolution 3", resolution(stringToFormula("not P(x) or not Q(y,x) or R(y)"), stringToFormula("not R(y) or not P(x) or not Q(y,x)"), stringToFormula("not P(x) or not Q(y,x)")));
/**************************************** CONTRACTION ************************************/
/**
 *
 * @param clause
 * @returns the set of possible contractions
 */
function getPossibleContractions(clause) {
    var contractions = [];
    for (var i in clause)
        for (var j in clause)
            if (i < j) {
                var mgu = unification(clause[i], clause[j]);
                if (mgu)
                    contractions.push(getContractedClause(clause, mgu));
            }
    return contractions;
}
UnitTest.run("contractionPossible of P(x) P(a)", getPossibleContractions([stringToFormula("P(x)"), stringToFormula("P(a)")]));
/**
 *
 * @param clause
 * @param mgu
 * @returns the contracted clause obtained from the clause and the mgu
 */
function getContractedClause(clause, mgu) {
    var contractedClause = [];
    for (var _i = 0, clause_1 = clause; _i < clause_1.length; _i++) {
        var l = clause_1[_i];
        var nl = substitutionApply(l, mgu);
        if (!Utils.contains(contractedClause, nl))
            contractedClause.push(nl);
    }
    return contractedClause;
}
/**
 *
 * @param clause
 * @param potentialContractedClause
 * tests whether potentialContractedClause is obtained from clause by the contraction rule
 */
function contraction(clause, potentialContractedClause) {
    if (clause == undefined)
        return ProofSystem.defaultRuleSuccess();
    if (potentialContractedClause == undefined)
        return ProofSystem.defaultRuleSuccess();
    var c0 = getDirectSubFormulas(clause);
    var c1 = getDirectSubFormulas(potentialContractedClause);
    for (var _i = 0, _a = getPossibleContractions(c0); _i < _a.length; _i++) {
        var contraction_1 = _a[_i];
        if (sameModuloVariableRenaming(contraction_1, c1))
            return ProofSystem.ruleSuccess("contraction");
    }
    return false;
}
//# sourceMappingURL=ResolutionProofSystem.js.map