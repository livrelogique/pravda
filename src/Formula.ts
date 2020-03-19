declare function FormulaParser(): any;

export type VariableSymbol = string;
export type PredicateSymbol = string;
export type FunctionSymbol = string;

export type Term = { type: "term", func: FunctionSymbol, args: Term[] };

export type Formula = { type: "and" | "or" | "->", args: Formula[] } |
{ type: "not", arg: Formula } |
{ type: "exists" | "forall", var: VariableSymbol, arg: Formula } |
{ type: "atomic", pred: PredicateSymbol, args: Term[] };

export function stringToFormula(str: string): Formula {
    try {
        return (<any>FormulaParser).parse(str);
    }
    catch (e) {
        console.log("error in parsing " + str);
        console.log(e);
        return null;
    }
}