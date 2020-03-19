import {Formula, stringToFormula} from "src/Formula";

type Proof = Formula[];



function stringToProof(str: string): Proof {
    let proof: Proof = new Array();
    str.split("\n").forEach((line) => { if (line != "") proof.push(stringToFormula(line)) });
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
    if (c.length != 2) return false;

    let c0: Formula[];
    if (c[0].type != "or") c0 = [c[0]]; else c0 = c[0].args;

    let c1: Formula[];
    if (c[1].type != "or") c1 = [c[1]]; else c1 = c[1].args;

    let r: Formula[];
    if (res.type != "or") r = [res]; else r = res.args;

    for (let a0 of c0)
        for (let a1 of c1)
            if (a0.type == "not" && a1.type == "atomic" && a0.arg == a1)
                return true;
}