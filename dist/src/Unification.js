import { stringToFormula, FormulaUtility } from "./Formula.js";
import * as UnitTest from "./UnitTest.js";
import { substitutionApply } from './Substitution.js';
function isVariable(t) { return (typeof t == "string"); }
UnitTest.run("isVariable(x)", isVariable("x"));
UnitTest.run("isVariable(P(x))", !isVariable(stringToFormula("P(x)")));
function unification2(E, sub) {
    /*  console.log(JSON.stringify(E));
      console.log(JSON.stringify(sub));*/
    if (E.length == 0)
        return sub;
    var equation = E.pop();
    var t = equation.term1;
    var u = equation.term2;
    if (isVariable(t) && t == u) {
        return unification2(E, sub);
    }
    else if (isVariable(t)) {
        if (FormulaUtility.isFreeVariable(u, t))
            throw "u contains " + t + " as a variable";
        sub[t] = u;
        E = E.map(function (eq) { return ({
            term1: substitutionApply(eq.term1, sub),
            term2: substitutionApply(eq.term2, sub)
        }); });
        for (var x in sub) {
            sub[x] = substitutionApply(sub[x], sub);
        }
        return unification2(E, sub);
    }
    else if (isVariable(u)) {
        E.push({ term1: u, term2: t });
        return unification2(E, sub);
    }
    else {
        if (t.type != u.type)
            throw "different type";
        switch (t.type) {
            case "atomic": if (t.pred != u.pred)
                throw "different pred";
            case "term": if (t.func != u.func)
                throw "different func";
        }
        if (t.args.length != u.args.length)
            throw "different number of args";
        for (var i in t.args) {
            E.push({ term1: t.args[i], term2: u.args[i] });
        }
        return unification2(E, sub);
    }
}
export function unification(t, u) {
    try {
        return unification2([{ term1: t, term2: u }], {});
    }
    catch (e) {
        return null;
    }
}
UnitTest.run("unifying p and p", unification(stringToFormula("p"), stringToFormula("p")) != null);
UnitTest.run("unifying P(x) and P(x)", unification(stringToFormula("P(x)"), stringToFormula("P(x)")) != null);
UnitTest.run("unifying P(x) and P(a)", unification(stringToFormula("P(x)"), stringToFormula("P(a)")));
UnitTest.run("unifyfing R(z, z) and R(u, f(y))", unification(stringToFormula("R(z,z)"), stringToFormula("R(u, f(y))")));
UnitTest.run("unifyfing R(x, f(x)) and R(f(x), x)", unification(stringToFormula("R(x,f(x))"), stringToFormula("R(f(x), x)")));
//# sourceMappingURL=Unification.js.map