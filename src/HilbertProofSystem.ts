import { ProofSystem } from "./ProofSystem.js";
import { Formula, getDirectSubFormulas, stringToFormula } from "./Formula.js";
import * as Utils from "./Utils.js";
import { Substitution } from "./Substitution.js"


export class HilbertProofSystem extends ProofSystem {
    constructor() {
        super();
        this.addRule0(axiomPattern("phi -> psi -> phi"));
        this.addRule0(axiomPattern("(phi -> (psi -> eta)) -> ((phi -> psi) -> (phi -> eta))"));
        this.addRule0(axiomPattern("(not phi -> not psi) -> (psi -> phi)"));
        this.addRule2(rule2Pattern("modusPonens", "phi", "phi -> psi", "psi"));
    }

}


function patternMatchingFormula(formula: Formula, pattern: Formula, initialSubstitution: Substitution = {}): Substitution {
    function isVariablePattern(s) {
        return ["phi", "psi", "chi", "eta"].indexOf(s) >= 0;
    }
    function patternMatchingFormula2(formula: Formula, pattern: Formula, sub: Substitution) {
        if (isVariablePattern(pattern)) {
            let v = <string>(<any>pattern);
            if (sub[v] == undefined)
                sub[v] = formula;
            else if (!Utils.same(formula, sub[v]))
                throw "pattern matching error because not the same formula registered in the substitution";
        }
        else {

            if (formula.type != pattern.type)
                throw "pattern matching error because different type: " + formula.type + " VS " + pattern.type + "(pattern is " + pattern + ")";

            if ((<any[]>formula.args).length != (<any[]>pattern.args).length)
                throw "pattern matching error because not the same number of arguments";
            for (let i in formula.args) {
                patternMatchingFormula2(formula.args[i], pattern.args[i], sub);
            }
        }
    }

    if (initialSubstitution == null) return null;

    let sub = initialSubstitution;

    try {
        patternMatchingFormula2(formula, pattern, sub);
    }
    catch (e) {
        return null;
    }
    return sub;
}


function axiomPattern(patternString) {
    return (formula) => {
        if (patternMatchingFormula(formula, stringToFormula(patternString)))
            return "axiom " + patternString;
        else
            return false;
    };
}



function rule2Pattern(ruleName, patternString1, patternString2, patternStringConclusion) {
    let test = (f1, f2, f3) => {
        let sub = {};
        sub = patternMatchingFormula(f1, stringToFormula(patternString1), sub);
        sub = patternMatchingFormula(f2, stringToFormula(patternString2), sub);
        sub = patternMatchingFormula(f3, stringToFormula(patternStringConclusion), sub);

        if (sub) return ruleName; else return false;
    };

    return (f1, f2, f3) => {
        let t = test(f1, f2, f3);
        if (t) return t;
        return test(f2, f1, f3);
    };
}