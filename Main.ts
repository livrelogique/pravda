declare function FormulaParser(): any;

type VariableSymbol = string;
type PredicateSymbol = string;
type FunctionSymbol = string;

type Term = { type: "term", func: FunctionSymbol, args: Term[] };

type Formula = { type: "and" | "or" | "->", args: Formula[] } |
{ type: "not", arg: Formula } |
{ type: "exists" | "forall", var: VariableSymbol, arg: Formula } |
{ type: "atomic", pred: PredicateSymbol, args: Term[] };

type Proof = Formula[];

function stringToFormula(str: string): Formula {
    try {
        return (<any>FormulaParser).parse(str);
    }
    catch(e) {
        console.log("error in parsing " + str);
        console.log(e);
        return null;
    }

}


function stringToProof(str: string): Proof {
    let proof: Proof = new Array();
    str.split("\n").forEach((line) => {if(line != "") proof.push(stringToFormula(line))});
    return proof;
}

function checkProof(proof: Proof) {
    console.log(proof);
    return;
}

function update() {
    let proofString = (<HTMLTextAreaElement>document.getElementById("proof")).value;
    checkProof(stringToProof(proofString));
}

(<HTMLTextAreaElement>document.getElementById("proof")).onchange = update;
(<HTMLTextAreaElement>document.getElementById("proof")).onclick = update;


function resolution(c: Formula[], res: Formula) {
    if(c.length != 2) return false;
    
    
}