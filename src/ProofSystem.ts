import { Formula } from './Formula';
import { Proof, stringToProof } from "./Proof.js";

type rule0 = (Formula) => (string | boolean);
type rule1 = (f1: Formula, f2: Formula) => (string | boolean);
type rule2 = (f1: Formula, f2: Formula, f3: Formula) => (string | boolean);

export class ProofSystem {
    private rules0: rule0[] = new Array();
    private rules1: rule1[] = new Array();
    private rules2: rule2[] = new Array();

    protected addRule0(test: rule0) { this.rules0.push(test); }
    protected addRule1(test: rule1) { this.rules1.push(test); }
    protected addRule2(test: rule2) { this.rules2.push(test); }

    public checkProof(proof: Proof) {

        for (let rule of this.rules0)
            for (let i = 0; i < proof.length; i++) if (proof.formulas[i] && proof.justification[i] == "???") {
                let output = rule(proof.formulas[i]);
                if (output) proof.justification[i] = <string>output;
            }


        for (let rule of this.rules1)
            for (let i = 0; i < proof.length; i++) if (proof.formulas[i] && proof.justification[i] == "???")
                for (let j = 0; j < i; j++) if (proof.formulas[j]) {
                    let output = rule(proof.formulas[j], proof.formulas[i]);
                    if (output) proof.justification[i] = output + " (" + (j + 1) + ")";
                }


        for (let rule of this.rules2)
            for (let i = 0; i < proof.length; i++) if (proof.formulas[i] && proof.justification[i] == "???")
                for (let j = 0; j < i; j++) if (proof.formulas[j])
                    for (let k = 0; k < j; k++) if (proof.formulas[k]) {
                        let output = rule(proof.formulas[k], proof.formulas[j], proof.formulas[i]);
                        if (output) proof.justification[i] = output + " (" + (k + 1) + " , " + (j + 1) + ")";
                    }

    }
}