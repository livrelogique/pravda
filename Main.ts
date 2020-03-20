import { Formula, stringToFormula, getLitterals } from "./src/Formula.js";

class Proof {
    formulas: Formula[] = new Array();
    justification: string[] = [];

    get length() { return this.formulas.length };
}



function stringToProof(str: string): Proof {
    let proof: Proof = new Proof();
    let lines: string[] = str.split("\n");
    for (let i in lines)
        if (lines[i] != "") {
            let pos = lines[i].indexOf("*");
            let formulaLine: string;
            if (pos < 0) formulaLine = lines[i]; else formulaLine = lines[i].substr(0, pos - 1);
            formulaLine = formulaLine.trim();
            proof.formulas.push(stringToFormula(formulaLine));
            if (pos >= 0)
                proof.justification[i] = "input";
        }
    return proof;
}

function checkProof(proof: Proof) {
    for (let i = 0; i < proof.length; i++)
        if (proof.justification[i] != "input")
            for (let j = 0; j < i; j++)
                for (let k = 0; k < j; k++)
                    if (resolution(proof.formulas[k], proof.formulas[j], proof.formulas[i]))
                        proof.justification[i] = "resolution rule on " + j + " and " + k;
                    else
                    proof.justification[i] = "???";
    return;
}

function update() {
    let proofString = (<HTMLTextAreaElement>document.getElementById("proof")).value;
    let proof: Proof = stringToProof(proofString);
    checkProof(proof);
    (<HTMLTextAreaElement>document.getElementById("justification")).value =
        proof.justification.join("\n");
    console.log(proof);
}

(<HTMLTextAreaElement>document.getElementById("proof")).onchange = update;
(<HTMLTextAreaElement>document.getElementById("proof")).onclick = update;
(<HTMLTextAreaElement>document.getElementById("proof")).onkeyup = update;

function same(obj1, obj2) {
    return JSON.stringify(obj1) == JSON.stringify(obj2);
}



function contains(element: any, array: any[]): boolean {
    for (let e of array) {
        if (same(e, element)) {
            return true;
        }
    }
    return false;
}

function resolution(cc0: Formula, cc1: Formula, res: Formula) {
    let c0: Formula[] = getLitterals(cc0);
    let c1: Formula[] = getLitterals(cc1);
    let r: Formula[] = getLitterals(res);

    for (let l of r)
        if (!contains(l, c0) && !contains(l, c1)) return false;

    function getLit(myClause, r) {
        for (let a0 of myClause)
            if (!contains(a0, r)) {
                return a0;
            }
        return undefined;
    }

    let l0 = getLit(c0, r);
    let l1 = getLit(c1, r);

    console.log(l0)
    console.log(l1)
    if (l0 == undefined) return false;
    if (l1 == undefined) return false;

    for (let l of c0)
        if (!same(l, l0) && !contains(l, r))
            return false;

    for (let l of c1)
        if (!same(l, l1) && !contains(l, r))
            return false;

    if (l0.type != "not")
        [l1, l0] = [l0, l1];

    if (l0.type == "not" && l1.type == "atomic" && same(l0.arg, l1))
        return true;

    return false;
}
