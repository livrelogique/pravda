import { FormulaUtility } from './Formula.js';
import { ProofSystem } from "./ProofSystem.js";
import { patternMatchingFormula, axiomPattern,
         rule1Pattern, rule2Pattern, rule3Pattern } from "./PatternMatching.js";
import * as Utils from "./Utils.js";

export class SequentCalculus extends ProofSystem {
    constructor() {

        super();
        this.addRule0(
            axiomPattern("axiom", "Gamma |- Delta",
                (sub) => {
                    return Utils.isNotEmptyIntersection(sub["Gamma"].args, sub["Delta"].args);
                }));

        this.addRule0(
            axiomPattern("bottom left", "Gamma |- Delta",
                (sub) => Utils.contains(sub["Gamma"].args, {type: "false", args: []}))
        );

        this.addRule0(
            axiomPattern("top right", "Gamma |- Delta",
                (sub) => Utils.contains(sub["Delta"].args, {type: "true", args: []}))
        );

        function negRulePattern(gammaPlus: any[], delta: any[], gamma: any[], deltaPlus: any[]): boolean {
            if (!Utils.includes(gammaPlus, gamma) || gammaPlus.length != gamma.length + 1) {
                return false;
            }

            let pFormula = {
                type: "not",
                args: Utils.setDifference(gammaPlus, gamma)
            };

            return Utils.isSetPlusElement(deltaPlus, delta, pFormula);
        }

        this.addRule1(
            rule1Pattern("neg right", "Gamma+ |- Delta", "Gamma |- Delta+",
                (sub) => negRulePattern(sub["Gamma+"].args, sub["Delta"].args,
                                        sub["Gamma"].args, sub["Delta+"].args)));

        this.addRule1(
            rule1Pattern("neg left", "Gamma |- Delta+", "Gamma+ |- Delta",
                (sub) => negRulePattern(sub["Delta+"].args, sub["Gamma"].args,
                                        sub["Delta"].args, sub["Gamma+"].args)));

        /**
         *
         * @param gammaHyp
         * @param deltaHyp
         * @param gammaConcl
         * @param deltaConcl
         * @param formulaType
         * @return true iff gammaHyp |- deltaHyp and gammaConcl |- deltaConcl are two sequents of
         * the form: [gamma, A |- delta, B] and [gamma |- delta, formulaType(A U B)], where A and B are sets
         * of formulas such that |A U B| = 2
         */
        function noCasesRulePattern(gammaHyp: any[], deltaHyp: any[],
                                    gammaConcl: any[], deltaConcl: any[], formulaType: string): boolean {

            let formulas = Utils.setDifference(gammaHyp, gammaConcl).concat(
                Utils.setDifference(deltaHyp, deltaConcl));

            //console.log(formulas);

            if (formulas.length != 2 || !Utils.includes(gammaHyp, gammaConcl)) {
                return false;
            }

            let pFormula = {
                type: formulaType,
                args: formulas
            };

            return Utils.isSetPlusElement(deltaConcl, Utils.setDifference(deltaHyp, formulas), pFormula);
        }

        this.addRule1(
            rule1Pattern("or right", "Gamma |- Delta", "Gamma |- Delta+",
                (sub) => noCasesRulePattern(sub["Gamma"].args, sub["Delta"].args,
                                            sub["Gamma"].args, sub["Delta+"].args, "or"))
        );

        this.addRule1(
            rule1Pattern("and left", "Gamma+ |- Delta", "Gamma |- Delta",
                (sub) => noCasesRulePattern(sub["Delta"].args, sub["Gamma+"].args,
                                            sub["Delta"].args, sub["Gamma"].args, "and"))
        );

        this.addRule1(
            rule1Pattern("impl right", "Gamma+ |- Delta", "Gamma |- Sigma",
                (sub) => {
                    // We must add a condition here on the sequents, since we can't
                    // verify it only by parsing like the two other rules
                    if (sub["Gamma+"].args.length != sub["Gamma"].args.length + 1 ||
                        sub["Delta"].args.length != sub["Sigma"].args.length) {
                        return false;
                    }
                    return noCasesRulePattern(sub["Gamma+"].args, sub["Delta"].args,
                                              sub["Gamma"].args, sub["Sigma"].args, "->")
                })
        );



        /**
         *
         * @param deltaHyp1
         * @param deltaHyp2
         * @param deltaConcl
         * @return true iff deltaHyp1, deltaHyp2, deltaConcl are of the form delta, phi; delta, psi;
         * delta, formulatype(phi, psi)
         */
        function andOrRulePattern(deltaHyp1: any[], deltaHyp2: any[], deltaConcl: any[], formulaType: string) {
            let phi = Utils.setDifference(deltaHyp1, deltaConcl);
            let psi = Utils.setDifference(deltaHyp2, deltaConcl);
            if (phi.length != 1 || psi.length != 1) { return false; }

            let pFormula = {
                type: formulaType,
                args: phi.concat(psi)
            };

            let b1 = Utils.isSetPlusElement(deltaConcl, Utils.setDifference(deltaHyp1, phi), pFormula);
            let b2 = Utils.isSetPlusElement(deltaConcl, Utils.setDifference(deltaHyp2, psi), pFormula);

            return b1 && b2;
        }

        this.addRule2(rule2Pattern("and right", "Gamma |- Theta", "Gamma |- Sigma", "Gamma |- Delta",
            (sub) => andOrRulePattern(sub["Theta"].args, sub["Sigma"].args, sub["Delta"].args, "and")
            ));

        this.addRule2(rule2Pattern("or left", "Gamma |- Delta", "Theta |- Delta", "Sigma |- Delta",
            (sub) => andOrRulePattern(sub["Gamma"].args, sub["Theta"].args, sub["Sigma"].args, "or")));

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
        function implRulePattern(gammaHyp1: any[],
                                 gammaHyp2: any[], deltaHyp2: any[],
                                 gammaConcl: any[], deltaConcl: any[], formulaType: string): boolean {

            if (gammaHyp1.length != gammaConcl.length) { return false; }

            let phi = Utils.setDifference(gammaHyp1, gammaConcl);
            let psi = Utils.setDifference(deltaHyp2, deltaConcl);
            if (phi.length != 1 || psi.length != 1) { return false; }

            let pFormula = {
                type: formulaType,
                args: psi.concat(phi)
            };

            let b1 = Utils.isSetPlusElement(deltaHyp2, deltaConcl, psi[0]);
            let b2 = Utils.isSetPlusElement(gammaConcl, Utils.setDifference(gammaHyp1, phi), pFormula);
            let b3 = Utils.isSetPlusElement(gammaConcl, gammaHyp2, pFormula);
            return b1 && b2 && b3;
        }

        this.addRule2(rule2Pattern("impl left", "Gamma+ |- Delta", "Gamma |- Delta+", "Theta |- Delta",
            (sub) => implRulePattern(sub["Gamma+"].args,
                                     sub["Gamma"].args, sub["Delta+"].args,
                                     sub["Theta"].args, sub["Delta"].args, "->")));
    }
}
