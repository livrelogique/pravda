import * as Utils from "./Utils.js"
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
export function negRulePattern(gammaHyp: any[], deltaHyp: any[],
                               gammaConcl: any[], deltaConcl: any[]): boolean {
    if (!Utils.includes(gammaHyp, gammaConcl) || gammaHyp.length != gammaConcl.length + 1) { return false; }

    let pFormula = {
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
export function orRightRulePattern(deltaHyp: any[],  deltaConcl: any[], formulaType: string): boolean {

    let formulas = Utils.multisetDifference(deltaHyp, deltaConcl);
    if (formulas.length != 2 || deltaConcl.length + 1 != deltaHyp.length) { return false; }

    let pFormula = {
        type: formulaType,
        args: formulas
    };

    return Utils.isMultisetPlusElement(deltaConcl,
                                       Utils.multisetDifference(deltaHyp, formulas), pFormula);
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

export function implRightRulePattern(gammaHyp: any[], deltaHyp: any[], gammaConcl: any[], deltaConcl: any[],
                                     formulaType: string) {

    let phiArray = Utils.multisetDifference(gammaHyp, gammaConcl);
    let psiArray = Utils.multisetDifference(deltaHyp, deltaConcl);
    if (phiArray.length != 1 || psiArray.length != 1) { return false; }

    let pFormula = {
        type: formulaType,
        args: phiArray.concat(psiArray)
    };


    let b1 = Utils.isMultisetPlusElement(gammaHyp, gammaConcl, phiArray[0]);
    let b2 = Utils.isMultisetPlusElement(deltaHyp,
                                         Utils.multisetDifference(deltaConcl, [pFormula]), psiArray[0]);
    let b3 = Utils.isMultisetPlusElement(deltaConcl,
                                         Utils.multisetDifference(deltaHyp, psiArray), pFormula);

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
export function orLeftRulePattern(deltaHyp1: any[], deltaHyp2: any[], deltaConcl: any[], formulaType: string) {
    let phi = Utils.multisetDifference(deltaHyp1, deltaConcl);
    let psi = Utils.multisetDifference(deltaHyp2, deltaConcl);
    if (phi.length != 1 || psi.length != 1) { return false; }

    let pFormula = {
        type: formulaType,
        args: phi.concat(psi)
    };

    let b1 = Utils.isMultisetPlusElement(deltaConcl,
                                         Utils.multisetDifference(deltaHyp1, phi), pFormula);
    let b2 = Utils.isMultisetPlusElement(deltaConcl,
                                         Utils.multisetDifference(deltaHyp2, psi), pFormula);

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
export function implLeftRulePattern(gammaHyp1: any[],
                                    gammaHyp2: any[], deltaHyp2: any[],
                                    gammaConcl: any[], deltaConcl: any[], formulaType: string): boolean {

    if (gammaHyp1.length != gammaConcl.length) { return false; }

    let phi = Utils.multisetDifference(gammaHyp1, gammaConcl);
    let psi = Utils.multisetDifference(deltaHyp2, deltaConcl);
    if (phi.length != 1 || psi.length != 1) { return false; }

    let pFormula = {
        type: formulaType,
        args: psi.concat(phi)
    };

    let b1 = Utils.isMultisetPlusElement(deltaHyp2, deltaConcl, psi[0]);
    let b2 = Utils.isMultisetPlusElement(gammaConcl,
                                         Utils.multisetDifference(gammaHyp1, phi), pFormula);
    let b3 = Utils.isMultisetPlusElement(gammaConcl, gammaHyp2, pFormula);
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
export function quantifierRulePattern(gammaHyp: any[], gammaConcl: any[], deltaHyp: any[],
                                      quantifier: string, allowSubstitution: boolean): any {

    let pFormulaArray = Utils.multisetDifference(gammaConcl, gammaHyp);
    if (pFormulaArray.length != 1) { return false; }

    let pFormula = pFormulaArray[0];
    if (pFormula.type != quantifier) { return false; }
    // We know pFormula is Qx. phi(x)

    let phi = FormulaUtility.getQuantifierSub(pFormula);
    if (allowSubstitution) {
        let psiArray = Utils.multisetDifference(gammaHyp, gammaConcl);
        if (psiArray.length != 1) { return false; }

        let psi = psiArray[0];
        if (patternMatchingFormula(phi, psi)) return true; else return false;
    } else {
        let x = FormulaUtility.getQuantifierVar(pFormula);

        // x should not be a free variable of any formula in gammaHyp or deltaHyp
        for (let f of Utils.multisetDifference(gammaHyp, [phi]).concat(deltaHyp)) {
            if (FormulaUtility.isFreeVariable(f, x)) {
                let s = (quantifier == "forall") ? "forall right" : "exists left";
                return ProofSystem.ruleIssue(s + " but variable " + x + " is not free");
            }
        }

        return Utils.isMultisetPlusElement(gammaHyp,
                                           Utils.multisetDifference(gammaConcl, pFormulaArray), phi);
    }
}

/**
 *
 * @param gammaHyp
 * @param gammaConcl
 * @returns true iff gammaHyp and gammaConcl are of the form gamma, phi, phi and gamma, phi
 * respectively.
 */
export function contractionRulePattern(gammaHyp: any[], gammaConcl: any[]): boolean {
    if (gammaHyp.length != gammaConcl.length + 1) { return false; }

    let phiArray = Utils.multisetDifference(gammaHyp, gammaConcl);
    if (phiArray.length != 1) { return false; }

    let phi = phiArray[0];
    return Utils.contains(gammaConcl, phi);
}
