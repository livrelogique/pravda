import { ProofSystem } from "./ProofSystem.js";
import { axiomPattern, rule1Pattern, rule2Pattern } from "./PatternMatching.js";
import * as Utils from "./Utils.js";
import * as SCUtils from "./SeqCalcUtils.js";

export class SequentCalculus extends ProofSystem {
    constructor() {

        super();

        // Axioms
        this.addRule0(
            axiomPattern("axiom", "Gamma |- Delta",
                (sub) => {
                    return Utils.isNotEmptyIntersection(sub["Gamma"].args, sub["Delta"].args);
                }));

        this.addRule0(
            axiomPattern("bottom left", "Gamma |- Delta",
                (sub) => Utils.contains(sub["Gamma"].args, {type: "false", args: []}))
        );

        this.addRule0(
            axiomPattern("top right", "Gamma |- Delta",
                (sub) => Utils.contains(sub["Delta"].args, {type: "true", args: []}))
        );

        // Propositional rules
        this.addRule1(
            rule1Pattern("neg right", "Gamma+ |- Delta", "Gamma |- Delta+",
                (sub) => SCUtils.negRulePattern(sub["Gamma+"].args, sub["Delta"].args,
                                                sub["Gamma"].args, sub["Delta+"].args)));

        this.addRule1(
            rule1Pattern("neg left", "Gamma |- Delta+", "Gamma+ |- Delta",
                (sub) => SCUtils.negRulePattern(sub["Delta+"].args, sub["Gamma"].args,
                                                sub["Delta"].args, sub["Gamma+"].args)));

        this.addRule1(
            rule1Pattern("or right", "Gamma |- Delta", "Gamma |- Delta+",
                (sub) => SCUtils.orRightRulePattern(sub["Delta"].args, sub["Delta+"].args, "or")));

        this.addRule1(
            rule1Pattern("and left", "Gamma+ |- Delta", "Gamma |- Delta",
                (sub) => SCUtils.orRightRulePattern(sub["Gamma+"].args, sub["Gamma"].args, "and")));

        this.addRule1(
            rule1Pattern("impl right", "Gamma+ |- Delta", "Gamma |- Sigma",
                (sub) => SCUtils.implRightRulePattern(sub["Gamma+"].args, sub["Delta"].args,
                                                      sub["Gamma"].args, sub["Sigma"].args, "->")));

        this.addRule2(rule2Pattern("and right", "Gamma |- Theta", "Gamma |- Sigma", "Gamma |- Delta",
            (sub) => SCUtils.orLeftRulePattern(sub["Theta"].args, sub["Sigma"].args, sub["Delta"].args, "and")
            ));

        this.addRule2(rule2Pattern("or left", "Gamma |- Delta", "Theta |- Delta", "Sigma |- Delta",
            (sub) => SCUtils.orLeftRulePattern(sub["Gamma"].args, sub["Theta"].args, sub["Sigma"].args, "or")));


        this.addRule2(rule2Pattern("impl left", "Gamma+ |- Delta", "Gamma |- Delta+", "Theta |- Delta",
            (sub) => SCUtils.implLeftRulePattern(sub["Gamma+"].args,
                                                 sub["Gamma"].args, sub["Delta+"].args,
                                                 sub["Theta"].args, sub["Delta"].args, "->")));

        // First order rules
        this.addRule1(rule1Pattern("exists right", "Gamma |- Sigma", "Gamma |- Delta",
            (sub) => SCUtils.quantifierRulePattern(sub["Sigma"].args, sub["Delta"].args, sub["Gamma"].args,
                                                   "exists", true)));

        this.addRule1(rule1Pattern("forall left", "Theta |- Delta", "Gamma |- Delta",
            (sub) => SCUtils.quantifierRulePattern(sub["Theta"].args, sub["Gamma"].args, sub["Delta"].args,
                                                   "forall", true)));

        this.addRule1(rule1Pattern("forall right", "Gamma |- Sigma", "Gamma |- Delta",
            (sub) => SCUtils.quantifierRulePattern(sub["Sigma"].args, sub["Delta"].args, sub["Gamma"].args,
                                                   "forall", false)));

        this.addRule1(rule1Pattern("exists left", "Theta |- Delta", "Gamma |- Delta",
            (sub) => SCUtils.quantifierRulePattern(sub["Theta"].args, sub["Gamma"].args, sub["Delta"].args,
                                           "exists", false)));

        // Structural rules
        this.addRule1(rule1Pattern("contra left", "Gamma+ |- Delta", "Gamma |- Delta",
                (sub) => SCUtils.contractionRulePattern(sub["Gamma+"].args, sub["Gamma"].args)));

        this.addRule1(rule1Pattern("contra right", "Gamma |- Delta+", "Gamma |- Delta",
                (sub) => SCUtils.contractionRulePattern(sub["Delta+"].args, sub["Delta"].args)));

    }
}
