import { Formula, stringToFormula } from "./Formula.js";

export class Proof {
    formulas: Formula[] = new Array();
    justification: string[] = [];

    public setJustificationInputFor(i) {
        this.justification[i] = "input";
    }

    public get length() { return this.formulas.length };
    public isCorrect() {
        for (let line of this.justification) {
            if (line.indexOf("???") >= 0) return false;
        }
        return true;
    }
}



export function stringToProof(str: string): Proof {
    let proof: Proof = new Proof();
    let lines: string[] = str.split("\n");
    for (let i in lines)
        if (lines[i] != "") {
            let pos = lines[i].indexOf("*");
            let formulaLine: string;
            if (pos < 0) formulaLine = lines[i]; else formulaLine = lines[i].substr(0, pos - 1);
            formulaLine = formulaLine.trim();
            proof.justification[i] = "???";
            try {
                proof.formulas[i] = stringToFormula(formulaLine);
                if (pos >= 0)
                    proof.justification[i] = "input";
            }
            catch (e) {
                proof.justification[i] = "??? parsing error: " + e.message;
            }
        }
        else
            proof.justification[i] = "";
    return proof;
}

