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
{ type: "true", args: Formula[]} | {type: "false", args: Formula[]};


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
    if(((<any>f).type == "true") || ((<any>f).type == "false"))
        return [];
    if ((<any>f).type != "or")
        return [f];
    else
        return (<any>f).args.map((f) => getDirectSubFormulas(f)).flat();
}



export class FormulaUtility {
    static getNotSub = (f: Formula) => {     return f.args[0]; }
    static not = (f: Formula) => {return { type: "not", args: [f] }};





}


UnitTest.run("not", Utils.same(stringToFormula("not p"), FormulaUtility.not(stringToFormula("p"))));