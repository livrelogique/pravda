import { Proof, stringToProof } from "./Proof.js";


export class ProofSystem {
    private rules0: any[] = new Array();
    private rules1: any[] = new Array();
    private rules2: any[] = new Array();

    protected addRule0(test) {
        this.rules0.push(test);
    }

    protected addRule1(test) {
        this.rules1.push(test);
    }

    protected addRule2(test) {
        this.rules2.push(test);
    }

    public checkProof(proof: Proof) {

        for (let rule of this.rules0)
            for (let i = 0; i < proof.length; i++) if (proof.formulas[i] && proof.justification[i] == "???") {
                let output = rule(proof.formulas[i]);
                if (output)
                    proof.justification[i] = output;
            }


        for (let rule of this.rules1)
            for (let i = 0; i < proof.length; i++) if (proof.formulas[i] && proof.justification[i] == "???")
                for (let j = 0; j < i; j++) if (proof.formulas[j]) {
                    let output = rule(proof.formulas[j], proof.formulas[i]);
                    if (output)
                        proof.justification[i] = output + " (" + (j + 1) + ")";
                }


        for (let rule of this.rules2)
            for (let i = 0; i < proof.length; i++) if (proof.formulas[i] && proof.justification[i] == "???")
                for (let j = 0; j < i; j++) if (proof.formulas[j])
                    for (let k = 0; k < j; k++) if (proof.formulas[k]) {
                        let output = rule(proof.formulas[k], proof.formulas[j], proof.formulas[i]);
                        if (output)
                            proof.justification[i] = output + " (" + (k + 1) + " , " + (j + 1) + ")";
                    }

    }
}