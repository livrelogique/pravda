declare function FormulaParser(): any;

export type VariableSymbol = string;
export type PredicateSymbol = string;
export type FunctionSymbol = string;

export type Term = { type: "term", func: FunctionSymbol, args: Term[] };

export type Formula = { type: "and" | "or" | "->", args: Formula[] } |
{ type: "not", arg: Formula } |
{ type: "exists" | "forall", var: VariableSymbol, arg: Formula } |
{ type: "atomic", pred: PredicateSymbol, args: Term[] } |
{ type: "true"} | {type: "false"};


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