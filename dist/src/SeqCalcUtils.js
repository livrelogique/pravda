import * as Utils from "./Utils.js";
import { patternMatchingFormula } from "./PatternMatching.js";
import { FormulaUtility } from "./Formula.js";
import { ProofSystem } from "./ProofSystem.js";
/**
 *
 * @param gammaHyp
 * @param deltaHyp
 * @param gammaConcl
 * @param deltaConcl
 * @returns true iff gammaHyp = gammaConcl, A and deltaConcl = deltaHyp, not A
 * */
export function negRulePattern(gammaHyp, deltaHyp, gammaConcl, deltaConcl) {
    if (!Utils.includes(gammaHyp, gammaConcl) || gammaHyp.length != gammaConcl.length + 1) {
        return false;
    }
    var pFormula = {
        type: "not",
        args: Utils.multisetDifference(gammaHyp, gammaConcl)
    };
    return Utils.isMultisetPlusElement(deltaConcl, deltaHyp, pFormula);
}
/**
 *
 * @param deltaHyp
 * @param deltaConcl
 * @param formulaType
 * @returns true iff deltaHyp and deltaConcl are multisets of the form:
 * delta, A, B and delta, formulaType(A, B)
 */
export function orRightRulePattern(deltaHyp, deltaConcl, formulaType) {
    var formulas = Utils.multisetDifference(deltaHyp, deltaConcl);
    if (formulas.length != 2 || deltaConcl.length + 1 != deltaHyp.length) {
        return false;
    }
    var pFormula = {
        type: formulaType,
        args: formulas
    };
    var pFormula2 = {
        type: formulaType,
        args: [formulas[1], formulas[0]]
    };
    return Utils.isMultisetPlusElement(deltaConcl, Utils.multisetDifference(deltaHyp, formulas), pFormula)
        || Utils.isMultisetPlusElement(deltaConcl, Utils.multisetDifference(deltaHyp, formulas), pFormula2);
}
/**
 *
 * @param gammaHyp
 * @param deltaHyp
 * @param gammaConcl
 * @param deltaConcl
 * @param formulaType
 * @returns true iff gammaHyp = gammaConc, A ; deltaHyp = delta, B ;
 * and deltaConcl = delta, formulaType(A, B)
 * */
export function implRightRulePattern(gammaHyp, deltaHyp, gammaConcl, deltaConcl, formulaType) {
    var phiArray = Utils.multisetDifference(gammaHyp, gammaConcl);
    var psiArray = Utils.multisetDifference(deltaHyp, deltaConcl);
    if (phiArray.length != 1 || psiArray.length != 1) {
        return false;
    }
    var pFormula = {
        type: formulaType,
        args: phiArray.concat(psiArray)
    };
    var b1 = Utils.isMultisetPlusElement(gammaHyp, gammaConcl, phiArray[0]);
    var b2 = Utils.isMultisetPlusElement(deltaHyp, Utils.multisetDifference(deltaConcl, [pFormula]), psiArray[0]);
    var b3 = Utils.isMultisetPlusElement(deltaConcl, Utils.multisetDifference(deltaHyp, psiArray), pFormula);
    return b1 && b2 && b3;
}
/**
 *
 * @param deltaHyp1
 * @param deltaHyp2
 * @param deltaConcl
 * @return true iff deltaHyp1, deltaHyp2, deltaConcl are of the form delta, phi; delta, psi;
 * delta, formulatype(phi, psi)
 */
export function orLeftRulePattern(deltaHyp1, deltaHyp2, deltaConcl, formulaType) {
    var phi = Utils.multisetDifference(deltaHyp1, deltaConcl);
    var psi = Utils.multisetDifference(deltaHyp2, deltaConcl);
    if (phi.length != 1 || psi.length != 1) {
        return false;
    }
    var pFormula = {
        type: formulaType,
        args: phi.concat(psi)
    };
    var b1 = Utils.isMultisetPlusElement(deltaConcl, Utils.multisetDifference(deltaHyp1, phi), pFormula);
    var b2 = Utils.isMultisetPlusElement(deltaConcl, Utils.multisetDifference(deltaHyp2, psi), pFormula);
    return b1 && b2;
}
/**
 *
 * @param gammaHyp1
 * @param gammaHyp2
 * @param deltaHyp2
 * @param gammaConcl
 * @param deltaConcl
 * @param array
 * @return true iff:
 * gammaHyp1 |- deltaConcl and gammaHyp2 |- deltaHyp2 are sequents of the form
 * gamma U {phi} |- delta, gamma |- delta U {psi}
 * and gammaConcl |- deltaConcl is a sequent of the form gamma U {formulaType(psi, phi)} |- delta
 */
export function implLeftRulePattern(gammaHyp1, gammaHyp2, deltaHyp2, gammaConcl, deltaConcl, formulaType) {
    if (gammaHyp1.length != gammaConcl.length) {
        return false;
    }
    var phi = Utils.multisetDifference(gammaHyp1, gammaConcl);
    var psi = Utils.multisetDifference(deltaHyp2, deltaConcl);
    if (phi.length != 1 || psi.length != 1) {
        return false;
    }
    var pFormula = {
        type: formulaType,
        args: psi.concat(phi)
    };
    var b1 = Utils.isMultisetPlusElement(deltaHyp2, deltaConcl, psi[0]);
    var b2 = Utils.isMultisetPlusElement(gammaConcl, Utils.multisetDifference(gammaHyp1, phi), pFormula);
    var b3 = Utils.isMultisetPlusElement(gammaConcl, gammaHyp2, pFormula);
    return b1 && b2 && b3;
}
/**
 *
 * @param gammaHyp
 * @param gammaConcl
 * @param deltaHyp
 * @param quantifier
 * @param allowSubstitution
 * @return There are two cases:
 * - If allowSubstitution is true, then true iff gammaConcl = gamma, quantifier x. phi(x) and
 *   gammaHyp = gamma, phi(u)
 * - If allowSubstitution is false, then true iff gammaConcl = gamma, quantifier x. phi(x) and
 *   gammaHyp = gamma, phi(x) with x not being free in gammaHyp or deltaHyp
 * */
export function quantifierRulePattern(gammaHyp, gammaConcl, deltaHyp, quantifier, allowSubstitution) {
    var pFormulaArray = Utils.multisetDifference(gammaConcl, gammaHyp);
    if (pFormulaArray.length != 1) {
        return false;
    }
    var pFormula = pFormulaArray[0];
    if (pFormula.type != quantifier) {
        return false;
    }
    // We know pFormula is Qx. phi(x)
    var phi = FormulaUtility.getQuantifierSub(pFormula);
    if (allowSubstitution) {
        var psiArray = Utils.multisetDifference(gammaHyp, gammaConcl);
        if (psiArray.length != 1) {
            return false;
        }
        var psi = psiArray[0];
        if (patternMatchingFormula(phi, psi))
            return true;
        else
            return false;
    }
    else {
        var x = FormulaUtility.getQuantifierVar(pFormula);
        // x should not be a free variable of any formula in gammaHyp or deltaHyp
        for (var _i = 0, _a = Utils.multisetDifference(gammaHyp, [phi]).concat(deltaHyp); _i < _a.length; _i++) {
            var f = _a[_i];
            if (FormulaUtility.isFreeVariable(f, x)) {
                var s = (quantifier == "forall") ? "forall right" : "exists left";
                return ProofSystem.ruleIssue(s + " but variable " + x + " is not free");
            }
        }
        return Utils.isMultisetPlusElement(gammaHyp, Utils.multisetDifference(gammaConcl, pFormulaArray), phi);
    }
}
/**
 *
 * @param gammaHyp
 * @param gammaConcl
 * @returns true iff gammaHyp and gammaConcl are of the form gamma, phi, phi and gamma, phi
 * respectively.
 */
export function contractionRulePattern(gammaHyp, gammaConcl) {
    if (gammaHyp.length != gammaConcl.length + 1) {
        return false;
    }
    var phiArray = Utils.multisetDifference(gammaHyp, gammaConcl);
    if (phiArray.length != 1) {
        return false;
    }
    var phi = phiArray[0];
    return Utils.contains(gammaConcl, phi);
}
//# sourceMappingURL=SeqCalcUtils.js.map