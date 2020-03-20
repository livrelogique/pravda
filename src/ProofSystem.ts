import { Proof, stringToProof } from "./Proof.js";


export class ProofSystem {

    private rules2: any[] = new Array();

    protected addRule2(test) {
        this.rules2.push(test);
    }

    public checkProof(proof: Proof) {
        for (let rule of this.rules2)
            for (let i = 0; i < proof.length; i++)
                if (proof.justification[i] == "???")
                    for (let j = 0; j < i; j++)
                        for (let k = 0; k < j; k++) {
                            let output = rule(proof.formulas[k], proof.formulas[j], proof.formulas[i]);
                            if (output)
                                proof.justification[i] = output + " (" + (k + 1) + " , " + (j + 1) + ")";
                        }

    }
}