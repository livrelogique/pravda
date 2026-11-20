import { stringToFormula } from "./Formula.js";
import * as Utils from "./Utils.js";
import { ProofSystem } from "./ProofSystem.js";
/**
 *
 * @param formula
 * @param pattern
 * @param initialSubstitution
 *
 * @returns a substitution sub such that the formula is obtained from the pattern by applying that substitution. If this is not possible it returns null. If the substitution is null, it returns null. In clear, it does pattern matching.
 */
export function patternMatchingFormula(formula, pattern, initialSubstitution) {
    if (initialSubstitution === void 0) { initialSubstitution = {}; }
    function patternMatchingFormula2(formula, pattern, sub) {
        if (typeof pattern == "string") {
            var v = pattern;
            if (sub[v] == undefined)
                sub[v] = formula;
            else if (!Utils.same(formula, sub[v]))
                throw "pattern matching error because not the same formula registered in the substitution";
        }
        else if (typeof formula == "string")
            throw "pattern matching error because formula is a string whereas the pattern is complex";
        else {
            if (formula.type != pattern.type)
                throw "pattern matching error because different type: " + formula.type + " VS " + pattern.type + "(pattern is " + pattern + ")";
            if (formula.args.length != pattern.args.length)
                throw "pattern matching error because not the same number of arguments";
            for (var i in formula.args)
                patternMatchingFormula2(formula.args[i], pattern.args[i], sub);
        }
    }
    //enables to call patternMatchingFormula on several patterns ;)
    if (initialSubstitution == null)
        return null;
    var sub = initialSubstitution;
    try {
        patternMatchingFormula2(formula, pattern, sub);
    }
    catch (e) {
        return null;
    }
    return sub;
}
/**
 *
 * @param ruleName
 * @param premissesStringPattern
 * @param patternStringConclusion
 * @param condition
 * @returns a function that checks whether the rule is applied
 */
export function rulePattern(ruleName, premissesStringPattern, patternStringConclusion, condition) {
    var premissesPattern = premissesStringPattern.map(function (s) { return stringToFormula(s); });
    var patternConclusion = stringToFormula(patternStringConclusion);
    var test = function (fs, f) {
        var sub = {};
        var isPartialCheck = (fs.indexOf(undefined) > -1); //not all the formulas are given (partial check)
        for (var i in fs)
            if (fs[i] != undefined)
                sub = patternMatchingFormula(fs[i], premissesPattern[i], sub);
        sub = patternMatchingFormula(f, patternConclusion, sub);
        if (sub) {
            if (condition == undefined || isPartialCheck)
                return ProofSystem.ruleSuccess(ruleName);
            var r = condition(sub);
            if (r == true)
                return ProofSystem.ruleSuccess(ruleName);
            if (r.type == "success" && r.msg == undefined) {
                r = ProofSystem.ruleSuccess(ruleName);
            }
            return r;
        }
    };
    if (premissesStringPattern.length == 2)
        return function (fs, f) {
            var t = test([fs[0], fs[1]], f);
            if (t)
                return t;
            return test([fs[1], fs[0]], f);
        };
    if (premissesStringPattern.length == 3)
        return function (fs, f) {
            var t = test([fs[0], fs[1], fs[2]], f);
            if (t)
                return t;
            t = test([fs[0], fs[2], fs[1]], f);
            if (t)
                return t;
            t = test([fs[1], fs[0], fs[2]], f);
            if (t)
                return t;
            t = test([fs[1], fs[2], fs[0]], f);
            if (t)
                return t;
            t = test([fs[2], fs[0], fs[1]], f);
            if (t)
                return t;
            return test([fs[2], fs[1], fs[0]], f);
        };
    return test;
}
export function axiomPattern(ruleName, stringPattern, condition) {
    return function (f) { return rulePattern(ruleName, [], stringPattern, condition)([], f); };
}
export function rule1Pattern(ruleName, premisseStringPattern, stringPattern, condition) {
    return function (f1, f) { return rulePattern(ruleName, [premisseStringPattern], stringPattern, condition)([f1], f); };
}
export function rule2Pattern(ruleName, premisseStringPattern1, premisseStringPattern2, stringPattern, condition) {
    return function (f1, f2, f) { return rulePattern(ruleName, [premisseStringPattern1, premisseStringPattern2], stringPattern, condition)([f1, f2], f); };
}
export function rule3Pattern(ruleName, premisseStringPattern1, premisseStringPattern2, premisseStringPattern3, stringPattern, condition) {
    return function (f1, f2, f3, f) { return rulePattern(ruleName, [premisseStringPattern1, premisseStringPattern2, premisseStringPattern3], stringPattern, condition)([f1, f2, f3], f); };
}
//# sourceMappingURL=PatternMatching.js.map