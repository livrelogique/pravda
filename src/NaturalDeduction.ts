import { FormulaUtility, stringToFormula } from './Formula.js';
import { ProofSystem } from "./ProofSystem.js";
import { patternMatchingFormula, axiomPattern, rule1Pattern, rule2Pattern, rule3Pattern } from "./PatternMatching.js";
import * as Utils from "./Utils.js";
import * as UnitTest from "./UnitTest.js"

export class NaturalDeduction extends ProofSystem {
    constructor() {
        super();
        this.addRule0(
            axiomPattern("Gamma, phi |- phi", "Gamma |- phi",
                (sub) => Utils.contains(sub["Gamma"].args, sub["phi"])));

        this.addRule1(
            rule1Pattern("weakening", "Gamma |- phi", "Gamma+ |- phi",
                (sub) => Utils.includes(sub["Gamma+"].args, sub["Gamma"].args)));

        this.addRule1(
            rule1Pattern("absurd", "Gamma |- bottom", "Delta |- phi",
                (sub) => {
                    return Utils.isSetPlusElement(sub["Gamma"].args,
                        sub["Delta"].args, FormulaUtility.not(sub["phi"]));
                }));


        this.addRule1(rule1Pattern("intro ->", "Gamma+ |- psi", "Gamma |- phi -> psi",
            (sub) => Utils.isSetPlusElement(sub["Gamma+"].args, sub["Gamma"].args, sub["phi"])));
        this.addRule2(rule2Pattern("elim ->", "Gamma |- phi -> psi", "Gamma |- phi", "Gamma |- psi"));

        this.addRule2(rule2Pattern("intro and", "Gamma |- phi", "Gamma |- psi", "Gamma |- phi and psi"));
        this.addRule1(rule1Pattern("elim and", "Gamma |- phi and psi", "Gamma |- phi"));
        this.addRule1(rule1Pattern("elim and", "Gamma |- phi and psi", "Gamma |- psi"));

        this.addRule1(rule1Pattern("intro or", "Gamma |- psi", "Gamma |- phi or psi"));
        this.addRule1(rule1Pattern("intro or", "Gamma |- phi", "Gamma |- phi or psi"));
        this.addRule3(rule3Pattern("elim or", "Gamma |- chi or psi", "Sigma |- phi", "Delta |- phi", "Gamma |- phi",
            (sub) => Utils.isSetPlusElement(sub["Sigma"].args, sub["Gamma"].args, sub["chi"]) &&
                Utils.isSetPlusElement(sub["Delta"].args, sub["Gamma"].args, sub["psi"])));

        this.addRule1(
            rule1Pattern("intro not", "Gamma+ |- bottom", "Gamma |- not phi",
                (sub) => { return Utils.isSetPlusElement(sub["Gamma+"].args, sub["Gamma"].args, sub["phi"]); }));

        this.addRule2(rule2Pattern("elim not", "Gamma |- not phi", "Gamma |- phi", "Gamma |- bottom"));

        this.addRule1(rule1Pattern("intro exists", "Gamma |- psi", "Gamma |- exists x phi",
            (sub) => { if (patternMatchingFormula(sub["psi"], sub["phi"])) return true; else return false; }));

        this.addRule2(rule2Pattern("elim exists", "Gamma |- exists x phi", "Gamma+ |- psi", "Gamma |- psi",
            (sub) => {
                if (FormulaUtility.isFreeVariable(sub["Gamma"], sub["x"]))
                    return ProofSystem.ruleIssue("elim exists but variable " + sub["x"] + " is not free");

                if (FormulaUtility.isFreeVariable(sub["psi"], sub["x"]))
                    return ProofSystem.ruleIssue("elim exists but variable " + sub["x"] + " is not free");

                return Utils.isSetPlusElement(sub["Gamma+"].args, sub["Gamma"].args, sub["phi"])
            }));



        this.addRule1(rule1Pattern("intro forall", "Gamma |- phi", "Gamma |- forall x phi",
            (sub) => {
                if (FormulaUtility.isFreeVariable(sub["Gamma"], sub["x"]))
                    return ProofSystem.ruleIssue("intro forall but variable " + sub["x"] + " is not free");
                return true;
            }));

        this.addRule1(rule1Pattern("elim forall", "Gamma |- forall x phi", "Gamma |- psi",
            (sub) => { if (patternMatchingFormula(sub["psi"], sub["phi"])) return true; else return false; }));
    }
}


