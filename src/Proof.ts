import { Formula, stringToFormula } from "./Formula.js";
import {RuleOutput} from "./ProofSystem.js";

export type Justification =  {type: "success" | "issue" | "input", msg: string}



export class Proof {
    formulas: Formula[] = new Array();
    justifications: Justification[] = [];

    public setJustificationInputFor(i) {
        this.justifications[i] = {type: "input", msg:""};
    }

    public get length() { return this.formulas.length };
    public isCorrect() {
        for (let justification of this.justifications) {
            if (justification.type != "success") return false;
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
            proof.justifications[i] = null;
            try {
                proof.formulas[i] = stringToFormula(formulaLine);
                if (pos >= 0)
                    proof.setJustificationInputFor(i);
            }
            catch (e) {
                proof.justifications[i] = {type: "issue", msg: "parsing error | " + e.message};
            }
        }
        else
            proof.justifications[i] = null;
    return proof;
}

