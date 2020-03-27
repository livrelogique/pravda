import { Formula } from './Formula';
import { Proof } from "./Proof.js";

export type RuleOutput = { type: "success", msg: string } | { type: "issue", msg: string } | false;
export type RuleOutputTmp = { type: "success", msg: string } | { type: "issue", msg: string } | boolean;


type Rule0 = (Formula) => RuleOutput;
type Rule1 = (f1: Formula, f2: Formula) => RuleOutput;
type Rule2 = (f1: Formula, f2: Formula, f3: Formula) => RuleOutput;



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

    protected addRule0(test: Rule0) { this.rules0.push(test); }
    protected addRule1(test: Rule1) { this.rules1.push(test); }
    protected addRule2(test: Rule2) { this.rules2.push(test); }

    public checkProof(proof: Proof) {
        for (let i = 0; i < proof.length; i++) if (proof.formulas[i] && proof.justification[i].indexOf("???") >= 0) {
            for (let rule of this.rules0) {
                let output = rule(proof.formulas[i]);
                if (output) {
                    proof.justification[i] = output.msg;
                    if (output.type == "success")
                        break;
                }

            }


            for (let rule of this.rules1)
                for (let j = 0; j < i; j++) if (proof.formulas[j]) {
                    let output = rule(proof.formulas[j], proof.formulas[i]);
                    if (output) {
                        proof.justification[i] = output.msg + " (" + (j + 1) + ")";
                    }
                }


            for (let rule of this.rules2)
                for (let j = 0; j < i; j++) if (proof.formulas[j])
                    for (let k = 0; k < j; k++) if (proof.formulas[k]) {
                        let output = rule(proof.formulas[k], proof.formulas[j], proof.formulas[i]);
                        if (output) {
                            proof.justification[i] = output.msg + " (" + (k + 1) + " , " + (j + 1) + ")";
                        }
                    }

        }

    }
}