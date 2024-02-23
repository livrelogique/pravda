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
            rule1Pattern("neg right", "Gamma+ |- Delta", "Gamma |- Sigma",
                (sub) => negRulePattern(sub["Gamma+"].args, sub["Delta"].args,
                                        sub["Gamma"].args, sub["Sigma"].args)));

        this.addRule1(
            rule1Pattern("neg left", "Gamma |- Sigma", "Gamma+ |- Delta",
                (sub) => negRulePattern(sub["Sigma"].args, sub["Gamma"].args,
                                        sub["Delta"].args, sub["Gamma+"].args)));

        function noCasesRulePattern(gammaHyp: any[], deltaHyp: any[],
                                    gammaConcl: any[], deltaConcl: any[], formulaType: string): boolean {
            // Delta = D, a, b
            // Sigma = D, a or b

            let formulas = Utils.setDifference(gammaHyp, gammaConcl).concat(
                Utils.setDifference(deltaHyp, deltaConcl));

            console.log(formulas);

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
            rule1Pattern("or right", "Gamma |- Delta", "Gamma |- Sigma",
                (sub) => noCasesRulePattern(sub["Gamma"].args, sub["Delta"].args,
                                            sub["Gamma"].args, sub["Sigma"].args, "or"))
        );

        this.addRule1(
            rule1Pattern("and left", "Gamma+ |- Delta", "Gamma |- Delta",
                (sub) => noCasesRulePattern(sub["Delta"].args, sub["Gamma+"].args,
                                            sub["Delta"].args, sub["Gamma"].args, "and"))
        );

        this.addRule1(
            rule1Pattern("impl right", "Gamma+ |- Delta", "Gamma |- Sigma",
                (sub) => noCasesRulePattern(sub["Gamma+"].args, sub["Delta"].args,
                                            sub["Gamma"].args, sub["Sigma"].args, "->"))
        );

        function casesRulePattern(delta1: any[], delta2: any[], delta: any[], formulaType: string): boolean {
            if (delta1.length != delta.length || delta2.length != delta.length) {
                return false;
            }


        }


    }
}
