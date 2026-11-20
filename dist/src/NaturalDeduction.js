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
import { FormulaUtility } from './Formula.js';
import { ProofSystem } from "./ProofSystem.js";
import { patternMatchingFormula, axiomPattern, rule1Pattern, rule2Pattern, rule3Pattern } from "./PatternMatching.js";
import * as Utils from "./Utils.js";
var NaturalDeduction = /** @class */ (function (_super) {
    __extends(NaturalDeduction, _super);
    function NaturalDeduction() {
        var _this = _super.call(this) || this;
        _this.addRule0(axiomPattern("axiom", "Gamma |- phi", function (sub) { return Utils.contains(sub["Gamma"].args, sub["phi"]); }));
        _this.addRule1(rule1Pattern("weakening", "Gamma |- phi", "Gamma+ |- phi", function (sub) { return Utils.includes(sub["Gamma+"].args, sub["Gamma"].args); }));
        _this.addRule1(rule1Pattern("absurd", "Gamma |- bottom", "Delta |- phi", function (sub) {
            return Utils.isSetPlusElement(sub["Gamma"].args, sub["Delta"].args, FormulaUtility.not(sub["phi"]));
        }));
        _this.addRule1(rule1Pattern("intro impl", "Gamma+ |- psi", "Gamma |- phi -> psi", function (sub) { return Utils.isSetPlusElement(sub["Gamma+"].args, sub["Gamma"].args, sub["phi"]); }));
        _this.addRule2(rule2Pattern("elim impl", "Gamma |- phi -> psi", "Gamma |- phi", "Gamma |- psi"));
        _this.addRule2(rule2Pattern("intro and", "Gamma |- phi", "Gamma |- psi", "Gamma |- phi and psi"));
        _this.addRule1(rule1Pattern("elim and", "Gamma |- phi and psi", "Gamma |- phi"));
        _this.addRule1(rule1Pattern("elim and", "Gamma |- phi and psi", "Gamma |- psi"));
        _this.addRule1(rule1Pattern("intro or", "Gamma |- psi", "Gamma |- phi or psi"));
        _this.addRule1(rule1Pattern("intro or", "Gamma |- phi", "Gamma |- phi or psi"));
        _this.addRule3(rule3Pattern("elim or", "Gamma |- chi or psi", "Sigma |- phi", "Delta |- phi", "Gamma |- phi", function (sub) { return Utils.isSetPlusElement(sub["Sigma"].args, sub["Gamma"].args, sub["chi"]) &&
            Utils.isSetPlusElement(sub["Delta"].args, sub["Gamma"].args, sub["psi"]); }));
        _this.addRule1(rule1Pattern("intro not", "Gamma+ |- bottom", "Gamma |- not phi", function (sub) { return Utils.isSetPlusElement(sub["Gamma+"].args, sub["Gamma"].args, sub["phi"]); }));
        _this.addRule2(rule2Pattern("elim not", "Gamma |- not phi", "Gamma |- phi", "Gamma |- bottom"));
        _this.addRule1(rule1Pattern("intro exists", "Gamma |- psi", "Gamma |- exists x phi", function (sub) { if (patternMatchingFormula(sub["psi"], sub["phi"]))
            return true;
        else
            return false; }));
        _this.addRule2(rule2Pattern("elim exists", "Gamma |- exists x phi", "Gamma+ |- psi", "Gamma |- psi", function (sub) {
            if (FormulaUtility.isFreeVariable(sub["Gamma"], sub["x"]))
                return ProofSystem.ruleIssue("elim exists but variable " + sub["x"] + " is not free");
            if (FormulaUtility.isFreeVariable(sub["psi"], sub["x"]))
                return ProofSystem.ruleIssue("elim exists but variable " + sub["x"] + " is not free");
            return Utils.isSetPlusElement(sub["Gamma+"].args, sub["Gamma"].args, sub["phi"]);
        }));
        _this.addRule1(rule1Pattern("intro forall", "Gamma |- phi", "Gamma |- forall x phi", function (sub) {
            if (FormulaUtility.isFreeVariable(sub["Gamma"], sub["x"]))
                return ProofSystem.ruleIssue("intro forall but variable " + sub["x"] + " is not free");
            return true;
        }));
        _this.addRule1(rule1Pattern("elim forall", "Gamma |- forall x phi", "Gamma |- psi", function (sub) { if (patternMatchingFormula(sub["psi"], sub["phi"]))
            return true;
        else
            return false; }));
        return _this;
    }
    return NaturalDeduction;
}(ProofSystem));
export { NaturalDeduction };
//# sourceMappingURL=NaturalDeduction.js.map