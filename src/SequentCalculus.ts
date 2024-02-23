import { FormulaUtility } from './Formula.js';
import { ProofSystem } from "./ProofSystem.js";
import { patternMatchingFormula, axiomPattern, rule1Pattern, rule2Pattern, rule3Pattern } from "./PatternMatching.js";
import * as Utils from "./Utils.js";

export class SequentCalculus extends ProofSystem {
    constructor() {

        super();
        this.addRule0(
            axiomPattern("axiom", "Gamma |- Delta",
                (sub) => {
                    console.log(sub["Delta"]);
                    let b = Utils.isNotEmptyIntersection(sub["Gamma"].args, sub["Delta"].args);
                    console.log(b);
                    return b;
                }));
    }
}
