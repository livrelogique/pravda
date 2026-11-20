import * as Utils from "./Utils.js";
import * as UnitTest from "./UnitTest.js";
/*
 @param a string, e.g. "forall x (P(x) or Q(x))"
 @returns the internal representation of the corresponding formula
*/
export function stringToFormula(str) {
    return FormulaParser.parse(str);
}
/**
 *
 * @param f a formula
 * @returns the LaTEX code corresponding to f
 */
export function formulaToLaTeX(f) {
    function arrayToLaTEX(array) {
        if (array.length == 0)
            return "";
        if (array.length == 1)
            return formulaToLaTeX(array[0]);
        var s = formulaToLaTeX(array[0]);
        for (var i = 1; i < array.length; i++) {
            s += ", " + formulaToLaTeX(array[i]);
        }
        return s;
    }
    function arrayToLaTEXWithParenthesis(array) {
        if (array.length == 0)
            return "";
        else
            return "(" + arrayToLaTEX(array) + ")";
    }
    if (typeof f == "string")
        return f;
    else if (f instanceof Array) {
        return arrayToLaTEX(f);
    }
    else {
        switch (f.type) {
            case "false": return "\\bot";
            case "true": return "\\top";
            case "atomic": return f.pred + arrayToLaTEXWithParenthesis(f.args);
            case "term": return f.func + arrayToLaTEXWithParenthesis(f.args);
            case "and": return "(".concat(formulaToLaTeX(f.args[0]), ") \\wedge (").concat(formulaToLaTeX(f.args[1]), ")");
            case "or": return "(".concat(formulaToLaTeX(f.args[0]), ") \\vee (").concat(formulaToLaTeX(f.args[1]), ")");
            case "->": return "(".concat(formulaToLaTeX(f.args[0]), ") \\rightarrow (").concat(formulaToLaTeX(f.args[1]), ")");
            case "not": return "\\neg (".concat(formulaToLaTeX(f.args[0]), ")");
            case "exists": return "\\exists  ".concat(f.args[0], " (").concat(formulaToLaTeX(f.args[1]), ")");
            case "forall": return "\\forall  ".concat(f.args[0], " (").concat(formulaToLaTeX(f.args[1]), ")");
            case "sequent": return "".concat(formulaToLaTeX(f.args[0].args), " \\vdash ").concat(formulaToLaTeX(f.args[1]));
            default: throw "error in formulaToString";
        }
    }
}
/*
@input a formula that is supposed to be a clause
@output the array of litterals
*/
export function getDirectSubFormulas(f) {
    if ((f.type == "true") || (f.type == "false"))
        return [];
    if (f.type != "or")
        return [f];
    else
        return f.args.map(function (f) { return getDirectSubFormulas(f); }).flat();
}
/**
 * This class contains static methods to manipulate formulas.
 */
var FormulaUtility = /** @class */ (function () {
    function FormulaUtility() {
    }
    /**
 *
 * @param f
 * @param x
 *
 * @returns true iff x appears as a free variable in f
 */
    FormulaUtility.isFreeVariable = function (f, x) {
        if (f instanceof Array) {
            for (var _i = 0, f_1 = f; _i < f_1.length; _i++) {
                var o = f_1[_i];
                if (FormulaUtility.isFreeVariable(o, x))
                    return true;
            }
            return false;
        }
        else if (typeof f == "string")
            return f == x;
        else if (f.type == "forall" || f.type == "exists") {
            if (f.args[0] == x)
                return false;
            return FormulaUtility.isFreeVariable(f.args[1], x);
        }
        else {
            for (var _a = 0, _b = f.args; _a < _b.length; _a++) {
                var o = _b[_a];
                if (FormulaUtility.isFreeVariable(o, x))
                    return true;
            }
            return false;
        }
    };
    /**
     * @param a formula of the form "(not phi)"
     * @returns phi
     */
    FormulaUtility.getNotSub = function (f) { return f.args[0]; };
    /**
         * @param phi a formula
         * @returns the formula "(not phi)"
         */
    FormulaUtility.not = function (f) { return { type: "not", args: [f] }; };
    /**
     * @param a formula of the form Q x. phi(x)
     * @returns phi(x)
     * */
    FormulaUtility.getQuantifierSub = function (f) { return f.args[1]; };
    /**
     * @param a formula of the form Q x. phi(x)
     * @returns x
     * */
    FormulaUtility.getQuantifierVar = function (f) { return f.args[0]; };
    /**
         * @param phi an expression
         * @returns true iff it is a variable
         */
    FormulaUtility.isVariable = function (f) { return (typeof f == "string"); };
    return FormulaUtility;
}());
export { FormulaUtility };
UnitTest.run("not", Utils.same(stringToFormula("not p"), FormulaUtility.not(stringToFormula("p"))));
UnitTest.run("isFreeVariable", FormulaUtility.isFreeVariable("x", "x"));
UnitTest.run("isFreeVariable", !FormulaUtility.isFreeVariable(stringToFormula("forall x P(x)"), "x"));
UnitTest.run("isFreeVariable", !FormulaUtility.isFreeVariable("y", "x"));
UnitTest.run("isFreeVariable", FormulaUtility.isFreeVariable(stringToFormula("P(x)"), "x"));
UnitTest.run("isFreeVariable", !FormulaUtility.isFreeVariable(stringToFormula("P(y)"), "x"));
UnitTest.run("isFreeVariable", FormulaUtility.isFreeVariable(stringToFormula("P(y) and P(x)"), "x"));
//# sourceMappingURL=Formula.js.map