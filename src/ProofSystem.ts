import { Formula } from './Formula';
import { Proof } from "./Proof.js";

export type RuleOutput = { type: "success", msg: string } | { type: "issue", msg: string } | false;
export type RuleOutputTmp = { type: "success", msg: string } | { type: "issue", msg: string } | boolean;


type Rule0 = (Formula) => RuleOutput;
type Rule1 = (f1: Formula, f2: Formula) => RuleOutput;
type Rule2 = (f1: Formula, f2: Formula, f3: Formula) => RuleOutput;
type Rule3 = (f1: Formula, f2: Formula, f3: Formula, f4: Formula) => RuleOutput;



export class ProofSystem {
    public static ruleSuccess(msg: string): RuleOutput {
        return { type: "success", msg: msg };
    }


    public static ruleIssue(msg: string): RuleOutput {
        return { type: "issue", msg: msg };
    }

    private rules0: Rule0[] = new Array();
    private rules1: Rule1[] = new Array();
    private rules2: Rule2[] = new Array();
    private rules3: Rule3[] = new Array();

    protected addRule0(test: Rule0) { this.rules0.push(test); }
    protected addRule1(test: Rule1) { this.rules1.push(test); }
    protected addRule2(test: Rule2) { this.rules2.push(test); }
    protected addRule3(test: Rule3) { this.rules3.push(test); }





    /**
     * 
     * @param proof 
     * @param i, suchthat  proof.justifications[j] are filled for all j < i
     * @effect modifies proof.justifications[i]
     */
    private checkFormula(proof, i) {
        for (let rule of this.rules0) {
            let output = rule(proof.formulas[i]);
            if (output) {
                proof.justifications[i] = output;
                if (output.type == "success") return;
            }

        }


        for (let rule of this.rules1)
        if (rule(undefined, proof.formulas[i]))
            for (let j = 0; j < i; j++) if (proof.formulas[j]) {
                let output = rule(proof.formulas[j], proof.formulas[i]);
                if (output) {
                    output.msg = output.msg + " (" + (j + 1) + ")";
                    proof.justifications[i] = output;
                    if (output.type == "success") return;
                }
            }


        for (let rule of this.rules2)
            if (rule(undefined, undefined, proof.formulas[i]))
                for (let j = 0; j < i; j++) if (proof.formulas[j])
                    if (rule(undefined, proof.formulas[j], proof.formulas[i]))
                        for (let k = 0; k < j; k++) if (proof.formulas[k]) {
                            let output = rule(proof.formulas[k], proof.formulas[j], proof.formulas[i]);
                            if (output) {
                                output.msg = output.msg + " (" + (k + 1) + " , " + (j + 1) + ")";
                                proof.justifications[i] = output;
                                if (output.type == "success") return;
                            }
                        }


        for (let rule of this.rules3)
            for (let j = 0; j < i; j++) if (proof.formulas[j])
                if (rule(undefined, undefined, proof.formulas[j], proof.formulas[i]))
                    for (let k = 0; k < j; k++) if (proof.formulas[k])
                        if (rule(undefined, proof.formulas[k], proof.formulas[j], proof.formulas[i]))
                            for (let l = 0; l < k; l++) if (proof.formulas[l]) {
                                let output = rule(proof.formulas[l], proof.formulas[k], proof.formulas[j], proof.formulas[i]);
                                if (output) {
                                    output.msg = output.msg + " (" + (k + 1) + " , " + (j + 1) + ", " + (l + 1) + ")";
                                    proof.justifications[i] = output;
                                    if (output.type == "success") return;
                                }
                            }
        if (proof.justifications[i] == null)
            proof.justifications[i] = { type: "issue", msg: "does not match any rule" };

    }


    public checkProof(proof: Proof) {
        for (let i = 0; i < proof.length; i++) if (proof.formulas[i] && proof.justifications[i] == null)
            this.checkFormula(proof, i);
    }
}