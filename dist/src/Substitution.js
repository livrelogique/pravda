import { stringToFormula, FormulaUtility, formulaToLaTeX } from "./Formula.js";
import * as UnitTest from "./UnitTest.js";
/**
 *
 * @param t
 * @param sub
 * @returns the term obtained by applying the substitution sub
 */
export function substitutionApply(t, sub) {
    if (FormulaUtility.isVariable(t))
        return (sub[t] == undefined) ? t : sub[t];
    else {
        var n = {};
        n.type = t.type;
        if (t.pred)
            n.pred = t.pred;
        if (t.func)
            n.func = t.func;
        n.args = t.args.map(function (a) { return substitutionApply(a, sub); });
        return n;
    }
}
UnitTest.run("substituying  [x := a] in P(x)", substitutionApply(stringToFormula("P(x)"), { "x": { type: "term", func: "a", args: [] } }));
UnitTest.run("substituying  [] in P(x)", formulaToLaTeX(substitutionApply(stringToFormula("P(x)"), {})));
UnitTest.run("substituying  [] in Q(x,y)", formulaToLaTeX(substitutionApply(stringToFormula("Q(x,y)"), {})));
UnitTest.run("substituying  [x, y] in Q(x,y)", formulaToLaTeX(substitutionApply(stringToFormula("Q(x,y)"), { x: "x", y: "y" })));
//# sourceMappingURL=Substitution.js.map