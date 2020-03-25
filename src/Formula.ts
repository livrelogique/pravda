import * as Utils from "./Utils.js";
import * as UnitTest from "./UnitTest.js"

declare function FormulaParser(): any;

export type VariableSymbol = string;
export type PredicateSymbol = string;
export type FunctionSymbol = string;

export type Term = { type: "term", func: FunctionSymbol, args: Term[] };

export type Formula = { type: "and" | "or" | "->", args: Formula[] } |
{ type: "not", args: Formula[] } |
{ type: "exists" | "forall", var: VariableSymbol, args: Formula } |
{ type: "atomic", pred: PredicateSymbol, args: Term[] } |
{ type: "true", args: Formula[] } | { type: "false", args: Formula[] };


/*
 @param a string, e.g. "forall x (P(x) or Q(x))"
 @returns the internal representation of the corresponding formula
*/
export function stringToFormula(str: string): Formula {
    return (<any>FormulaParser).parse(str);

}

/*
@input a formula that is supposed to be a clause
@output the array of litterals
*/
export function getDirectSubFormulas(f: Formula): Formula[] {
    if (((<any>f).type == "true") || ((<any>f).type == "false"))
        return [];
    if ((<any>f).type != "or")
        return [f];
    else
        return (<any>f).args.map((f) => getDirectSubFormulas(f)).flat();
}


function isFreeVariable(f, x): boolean {
    if (f instanceof Array) {
        for (let o of f) {
            if (isFreeVariable(o, x))
                return true;
        }
        return false;
    }
    else if (typeof f == "string") {
        return f == x;
    }
    else if (f.type == "forall" || f.type == "exists") {
        if (f.args[0] == x)
            return false;
        return isFreeVariable(f.args[1], x);
    }
    else {
        for (let o of f.args) {
            if (isFreeVariable(o, x))
                return true;
        }
        return false;
    }
}



export class FormulaUtility {
    static getNotSub = (f: Formula) => { return f.args[0]; }
    static not = (f: Formula) => { return { type: "not", args: [f] } };
    static isFreeVariable = isFreeVariable;




}


UnitTest.run("not", Utils.same(stringToFormula("not p"), FormulaUtility.not(stringToFormula("p"))));

UnitTest.run("isFreeVariable", FormulaUtility.isFreeVariable("x", "x"));
UnitTest.run("isFreeVariable", !FormulaUtility.isFreeVariable(stringToFormula("forall x P(x)"), "x"));
UnitTest.run("isFreeVariable", !FormulaUtility.isFreeVariable("y", "x"));
UnitTest.run("isFreeVariable", FormulaUtility.isFreeVariable(stringToFormula("P(x)"), "x"));
UnitTest.run("isFreeVariable", !FormulaUtility.isFreeVariable(stringToFormula("P(y)"), "x"));
UnitTest.run("isFreeVariable", FormulaUtility.isFreeVariable(stringToFormula("P(y) and P(x)"), "x"));