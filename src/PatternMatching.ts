import { Formula, getDirectSubFormulas, stringToFormula } from "./Formula.js";
import * as Utils from "./Utils.js";
import { ProofSystem, RuleOutput, RuleOutputTmp } from "./ProofSystem.js";
import { Substitution } from "./Substitution.js"


/**
 * 
 * @param formula 
 * @param pattern 
 * @param initialSubstitution 
 * 
 * @returns a substitution sub such that the formula is obtained from the pattern by applying that substitution. If this is not possible it returns null. If the substitution is null, it returns null. In clear, it does pattern matching.
 */
export function patternMatchingFormula(formula: Formula, pattern: Formula, initialSubstitution: Substitution = {}): Substitution {
    function isVariablePattern(s) { return typeof s == "string"; }

    function patternMatchingFormula2(formula: Formula, pattern: Formula, sub: Substitution) {
        if (isVariablePattern(pattern)) {
            let v = <string>(<any>pattern);
            if (sub[v] == undefined) sub[v] = formula;
            else if (!Utils.same(formula, sub[v]))
                throw "pattern matching error because not the same formula registered in the substitution";
        }
        else {
            if (formula.type != pattern.type)
                throw "pattern matching error because different type: " + formula.type + " VS " + pattern.type + "(pattern is " + pattern + ")";

            if ((<any[]>formula.args).length != (<any[]>pattern.args).length)
                throw "pattern matching error because not the same number of arguments";
            for (let i in formula.args)
                patternMatchingFormula2(formula.args[i], pattern.args[i], sub);
        }
    }

    //enables to call patternMatchingFormula on several patterns ;)
    if (initialSubstitution == null) return null;

    let sub = initialSubstitution;

    try { patternMatchingFormula2(formula, pattern, sub); }
    catch (e) { return null; }
    return sub;
}




export function rulePattern(ruleName: string,
    premissesStringPattern: string[],
    patternStringConclusion: string,
    condition?: (Substitution) => RuleOutputTmp) {

    let premissesPattern = premissesStringPattern.map((s) => stringToFormula(s));
    let patternConclusion = stringToFormula(patternStringConclusion);

    let test = function (fs, f): RuleOutput {
        let sub = {};
        for (let i in fs)
            sub = patternMatchingFormula(fs[i], premissesPattern[i], sub);
        sub = patternMatchingFormula(f, patternConclusion, sub);

        if (sub) {
            if (condition == undefined)
                return ProofSystem.ruleSuccess(ruleName);

            let r = condition(sub);

            if (r == true)
                return ProofSystem.ruleSuccess(ruleName);

            if ((<any>r).type == "success" && (<any>r).msg == undefined) {
                r = ProofSystem.ruleSuccess(ruleName);
            }
            return r;
        }

    };

    if (premissesStringPattern.length == 2)
        return (fs, f: Formula) => {
            let t = test([fs[0], fs[1]], f);
            if (t) return t;
            return test([fs[1], fs[0]], f);
        };
    return test;
}



export function axiomPattern(ruleName, stringPattern, condition?: (Substitution) => RuleOutputTmp) {
    return (f) => rulePattern(ruleName, [], stringPattern, condition)([], f);
}



export function rule1Pattern(ruleName, premisseStringPattern, stringPattern, condition?: (Substitution) => RuleOutputTmp) {
    return (f1, f) => rulePattern(ruleName, [premisseStringPattern], stringPattern, condition)([f1], f);
}


export function rule2Pattern(ruleName, premisseStringPattern1, premisseStringPattern2, stringPattern, condition?: (Substitution) => RuleOutputTmp) {
    return (f1, f2, f) => rulePattern(ruleName, [premisseStringPattern1, premisseStringPattern2], stringPattern, condition)([f1, f2], f);
}


export function rule3Pattern(ruleName, premisseStringPattern1, premisseStringPattern2, premisseStringPattern3, stringPattern, condition?: (Substitution) => RuleOutputTmp) {
    return (f1, f2, f3, f) => rulePattern(ruleName, [premisseStringPattern1, premisseStringPattern2, premisseStringPattern3], stringPattern, condition)([f1, f2, f3], f);
}