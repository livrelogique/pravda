import { Formula, stringToFormula, FormulaUtility, formulaToLaTeX } from "./Formula.js";
import * as UnitTest from "./UnitTest.js";


export type Substitution = { [v: string]: Formula; };

/**
 * 
 * @param t 
 * @param sub
 * @returns the term obtained by applying the substitution sub 
 */
export function substitutionApply(t, sub: Substitution) {
    if (FormulaUtility.isVariable(t))
        return (sub[t] == undefined) ? t : sub[t];
    else {
        const n: any = {};
        n.type = t.type;
        if (t.pred) n.pred = t.pred;
        if (t.func) n.func = t.func;
        n.args = [];
        for (const a of t.args)
            n.args.push(substitutionApply(a, sub));

        return n;
    }
}

UnitTest.run("substituying  [x := a] in P(x)",
    substitutionApply(stringToFormula("P(x)"), { "x": { type: "term", func: "a", args: [] } }));
UnitTest.run("substituying  [] in P(x)",
    formulaToLaTeX(substitutionApply(stringToFormula("P(x)"), {})));
UnitTest.run("substituying  [] in Q(x,y)",
    formulaToLaTeX(substitutionApply(stringToFormula("Q(x,y)"), {})));
UnitTest.run("substituying  [x, y] in Q(x,y)",
    formulaToLaTeX(substitutionApply(stringToFormula("Q(x,y)"), { x: "x", y: "y" })));
