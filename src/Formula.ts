import * as Utils from "./Utils.js";
import * as UnitTest from "./UnitTest.js"

declare function FormulaParser(): any;

export type VariableSymbol = string;
export type PredicateSymbol = string;
export type FunctionSymbol = string;

export type Term = { type: "term", func: FunctionSymbol, args: Term[] };

export type FormulaConstruction = { type: "and" | "or" | "->", args: Formula[] } |
{ type: "not", args: Formula[] } |
{ type: "exists" | "forall", var: VariableSymbol, args: Formula } |
{ type: "atomic", pred: PredicateSymbol, args: Term[] } |
{ type: "true", args: Formula[] } | { type: "false", args: Formula[] }

export type Formula = FormulaConstruction | Term | string;


/*
 @param a string, e.g. "forall x (P(x) or Q(x))"
 @returns the internal representation of the corresponding formula
*/
export function stringToFormula(str: string): Formula {
    return (<any>FormulaParser).parse(str);
}


/**
 * 
 * @param f a formula
 * @returns the LaTEX code corresponding to f
 */
export function formulaToLaTeX(f: Formula): string {
    function arrayToLaTEX(array: any[]) {
        if (array.length == 0) return "";

        if (array.length == 1)
            return formulaToLaTeX(array[0]);

        let s = formulaToLaTeX(array[0]);

        for (let i = 1; i < array.length; i++) {
            s += ", " + formulaToLaTeX(array[i]);
        }

        return s;
    }


    function arrayToLaTEXWithParenthesis(array: any[]) {
        if (array.length == 0) return "";
        else return "(" + arrayToLaTEX(array) + ")";
    }

    if (typeof f == "string")
        return f;
    else if (f instanceof Array) {
        return arrayToLaTEX(f);
    }
    else {
        switch ((<any>f).type) {
            case "false": return "\\bot";
            case "true": return "\\top";
            case "atomic": return (<any>f).pred + arrayToLaTEXWithParenthesis((<any>f).args);
            case "term": return (<any>f).func + arrayToLaTEXWithParenthesis((<any>f).args);
            case "and": return `(${formulaToLaTeX(f.args[0])}) \\wedge (${formulaToLaTeX(f.args[1])})`;
            case "or": return `(${formulaToLaTeX(f.args[0])}) \\vee (${formulaToLaTeX(f.args[1])})`;
            case "->": return `(${formulaToLaTeX(f.args[0])}) \\rightarrow (${formulaToLaTeX(f.args[1])})`;
            case "not": return `\\neg (${formulaToLaTeX(f.args[0])})`;
            case "exists": return `\\exists  ${f.args[0]} (${formulaToLaTeX(f.args[1])})`;
            case "forall": return `\\forall  ${f.args[0]} (${formulaToLaTeX(f.args[1])})`;
            case "sequent": return `${formulaToLaTeX(f.args[0].args)} \\vdash ${formulaToLaTeX(f.args[1])}`;
            default: throw "error in formulaToString";
        }
    }
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




/**
 * This class contains static methods to manipulate formulas.
 */
export class FormulaUtility {

    /**
     * @param a formula of the form "(not phi)"
     * @returns phi
     */
    static getNotSub = (f: FormulaConstruction) => { return f.args[0]; }

    /**
         * @param phi a formula
         * @returns the formula "(not phi)"
         */
    static not = (f: Formula) => { return { type: "not", args: [f] } };

    /**
     * @param a formula of the form Q x. phi(x)
     * @returns phi(x)
     * */

    static getQuantifierSub = (f: FormulaConstruction) => { return f.args[1]; }

    /**
     * @param a formula of the form Q x. phi(x)
     * @returns x
     * */

    static getQuantifierVar = (f: FormulaConstruction) => { return f.args[0]; }



    /**
         * @param phi an expression
         * @returns true iff it is a variable
         */
    static isVariable = (f: Formula) => (typeof f == "string");

    /**
 * 
 * @param f 
 * @param x 
 * 
 * @returns true iff x appears as a free variable in f
 */
    static isFreeVariable(f: Formula, x: string): boolean {
        if (f instanceof Array) {
            for (const o of f) if (FormulaUtility.isFreeVariable(o, x))
                return true;
            return false;
        }
        else if (typeof f == "string")
            return f == x;

        else if (f.type == "forall" || f.type == "exists") {
            if (f.args[0] == x) return false;
            return FormulaUtility.isFreeVariable(f.args[1], x);
        }
        else {
            for (const o of <any>f.args) if (FormulaUtility.isFreeVariable(o, x))
                return true;
            return false;
        }
    }
}


UnitTest.run("not", Utils.same(stringToFormula("not p"), FormulaUtility.not(stringToFormula("p"))));

UnitTest.run("isFreeVariable", FormulaUtility.isFreeVariable("x", "x"));
UnitTest.run("isFreeVariable", !FormulaUtility.isFreeVariable(stringToFormula("forall x P(x)"), "x"));
UnitTest.run("isFreeVariable", !FormulaUtility.isFreeVariable("y", "x"));
UnitTest.run("isFreeVariable", FormulaUtility.isFreeVariable(stringToFormula("P(x)"), "x"));
UnitTest.run("isFreeVariable", !FormulaUtility.isFreeVariable(stringToFormula("P(y)"), "x"));
UnitTest.run("isFreeVariable", FormulaUtility.isFreeVariable(stringToFormula("P(y) and P(x)"), "x"));
