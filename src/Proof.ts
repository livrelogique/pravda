import { Formula, stringToFormula } from "./Formula.js";
import {RuleOutput} from "./ProofSystem.js";

export type Justification =  {type: "success" | "issue" | "input", msg: string, previous: number[]}



export class Proof {
    formulas: Formula[] = new Array();
    lines: string[] = [];
    justifications: Justification[] = [];

    public setJustificationInputFor(i) {
        this.justifications[i] = {type: "input", msg:"", previous: []};
    }

    public get length() { return this.formulas.length };
    public isCorrect() {
        for (const justification of this.justifications) {
            if(justification != null)
            if(justification.type != "input")
            if (justification.type != "success") return false;
        }
        return true;
    }
}



export function stringToProof(str: string): Proof {
    const proof: Proof = new Proof();
    
    const lines: string[] = str.split("\n");
    lines.push("");
    proof.lines = lines;
    for (const i in lines)
        if (lines[i] != "") {
            const pos = lines[i].indexOf("*");
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
                proof.justifications[i] = {type: "issue", msg: "parsing error | " + e.message, previous: []};
            }
        }
        else
            proof.justifications[i] = null;
    return proof;
}

