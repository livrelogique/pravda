var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { ProofSystem } from "./ProofSystem.js";
import { axiomPattern, rule1Pattern, rule2Pattern } from "./PatternMatching.js";
import * as Utils from "./Utils.js";
import * as SCUtils from "./SeqCalcUtils.js";
var SequentCalculus = /** @class */ (function (_super) {
    __extends(SequentCalculus, _super);
    function SequentCalculus() {
        var _this = _super.call(this) || this;
        // Axioms
        _this.addRule0(axiomPattern("axiom", "Gamma |- Delta", function (sub) {
            return Utils.isNotEmptyIntersection(sub["Gamma"].args, sub["Delta"].args);
        }));
        _this.addRule0(axiomPattern("bottom left", "Gamma |- Delta", function (sub) { return Utils.contains(sub["Gamma"].args, { type: "false", args: [] }); }));
        _this.addRule0(axiomPattern("top right", "Gamma |- Delta", function (sub) { return Utils.contains(sub["Delta"].args, { type: "true", args: [] }); }));
        // Propositional rules
        _this.addRule1(rule1Pattern("neg right", "Gamma+ |- Delta", "Gamma |- Delta+", function (sub) { return SCUtils.negRulePattern(sub["Gamma+"].args, sub["Delta"].args, sub["Gamma"].args, sub["Delta+"].args); }));
        _this.addRule1(rule1Pattern("neg left", "Gamma |- Delta+", "Gamma+ |- Delta", function (sub) { return SCUtils.negRulePattern(sub["Delta+"].args, sub["Gamma"].args, sub["Delta"].args, sub["Gamma+"].args); }));
        _this.addRule1(rule1Pattern("or right", "Gamma |- Delta", "Gamma |- Delta+", function (sub) { return SCUtils.orRightRulePattern(sub["Delta"].args, sub["Delta+"].args, "or"); }));
        _this.addRule1(rule1Pattern("and left", "Gamma+ |- Delta", "Gamma |- Delta", function (sub) { return SCUtils.orRightRulePattern(sub["Gamma+"].args, sub["Gamma"].args, "and"); }));
        _this.addRule1(rule1Pattern("impl right", "Gamma+ |- Delta", "Gamma |- Sigma", function (sub) { return SCUtils.implRightRulePattern(sub["Gamma+"].args, sub["Delta"].args, sub["Gamma"].args, sub["Sigma"].args, "->"); }));
        _this.addRule2(rule2Pattern("and right", "Gamma |- Theta", "Gamma |- Sigma", "Gamma |- Delta", function (sub) { return SCUtils.orLeftRulePattern(sub["Theta"].args, sub["Sigma"].args, sub["Delta"].args, "and"); }));
        _this.addRule2(rule2Pattern("or left", "Gamma |- Delta", "Theta |- Delta", "Sigma |- Delta", function (sub) { return SCUtils.orLeftRulePattern(sub["Gamma"].args, sub["Theta"].args, sub["Sigma"].args, "or"); }));
        _this.addRule2(rule2Pattern("impl left", "Gamma+ |- Delta", "Gamma |- Delta+", "Theta |- Delta", function (sub) { return SCUtils.implLeftRulePattern(sub["Gamma+"].args, sub["Gamma"].args, sub["Delta+"].args, sub["Theta"].args, sub["Delta"].args, "->"); }));
        // First order rules
        _this.addRule1(rule1Pattern("exists right", "Gamma |- Sigma", "Gamma |- Delta", function (sub) { return SCUtils.quantifierRulePattern(sub["Sigma"].args, sub["Delta"].args, sub["Gamma"].args, "exists", true); }));
        _this.addRule1(rule1Pattern("forall left", "Theta |- Delta", "Gamma |- Delta", function (sub) { return SCUtils.quantifierRulePattern(sub["Theta"].args, sub["Gamma"].args, sub["Delta"].args, "forall", true); }));
        _this.addRule1(rule1Pattern("forall right", "Gamma |- Sigma", "Gamma |- Delta", function (sub) { return SCUtils.quantifierRulePattern(sub["Sigma"].args, sub["Delta"].args, sub["Gamma"].args, "forall", false); }));
        _this.addRule1(rule1Pattern("exists left", "Theta |- Delta", "Gamma |- Delta", function (sub) { return SCUtils.quantifierRulePattern(sub["Theta"].args, sub["Gamma"].args, sub["Delta"].args, "exists", false); }));
        // Structural rules
        _this.addRule1(rule1Pattern("contra left", "Gamma+ |- Delta", "Gamma |- Delta", function (sub) { return SCUtils.contractionRulePattern(sub["Gamma+"].args, sub["Gamma"].args); }));
        _this.addRule1(rule1Pattern("contra right", "Gamma |- Delta+", "Gamma |- Delta", function (sub) { return SCUtils.contractionRulePattern(sub["Delta+"].args, sub["Delta"].args); }));
        return _this;
    }
    return SequentCalculus;
}(ProofSystem));
export { SequentCalculus };
//# sourceMappingURL=SequentCalculus.js.map