import { Formula, stringToFormula, getLitterals } from "./src/Formula.js";

type Proof = Formula[];



function stringToProof(str: string): Proof {
    let proof: Proof = new Array();
    str.split("\n").forEach((line) => { if (line != "") proof.push(stringToFormula(line)) });
    return proof;
}

function checkProof(proof: Proof) {
    for(let i = 0; i < proof.length; i++)
        for(let j = 0; i < j; j++)
        for(let k = 0; k < j; k++)
        if(resolution([proof[k], proof[j]], proof[i]))
            console.log(i + "obtained from " + j + " and " + k);
    console.log(proof);
    return;
}

function update() {
    let proofString = (<HTMLTextAreaElement>document.getElementById("proof")).value;
    checkProof(stringToProof(proofString));
}

(<HTMLTextAreaElement>document.getElementById("proof")).onchange = update;
(<HTMLTextAreaElement>document.getElementById("proof")).onclick = update;

function same(obj1, obj2) {
    return JSON.stringify(obj1) == JSON.stringify(obj2);
}



function contains(element: any, array: any[]): boolean {
    for (let e of array) {
        if (same(e, element))
            return true;
    }
    return false;
}

function resolution(c: Formula[], res: Formula) {
    if (c.length != 2) return false;

    let c0: Formula[] = getLitterals(c[0]);
    let c1: Formula[] = getLitterals(c[1]);
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

    if (l0 == undefined) return false;
    if (l1 == undefined) return false;

    for (let l of c0)
        if (!same(l, l0) && !contains(l, r))
            return false;

    for (let l of c1)
        if (!same(l, l1) && !contains(l, r))
            return false;

    if (l0.type != "not")
        [l1, l0] = [l1, l0];

    if (l0.type == "not" && l1.type == "atomic" && same(l0.arg, l1))
        return true;

    return false;
}