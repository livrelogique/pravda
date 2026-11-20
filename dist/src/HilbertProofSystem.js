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
import { axiomPattern, rule2Pattern } from "./PatternMatching.js";
var HilbertProofSystem = /** @class */ (function (_super) {
    __extends(HilbertProofSystem, _super);
    function HilbertProofSystem() {
        var _this = _super.call(this) || this;
        _this.addRule0(axiomPattern("phi -> psi -> phi", "phi -> psi -> phi"));
        _this.addRule0(axiomPattern("axiom (phi -> (psi -> eta)) -> ((phi -> psi) -> (phi -> eta))", "(phi -> (psi -> eta)) -> ((phi -> psi) -> (phi -> eta))"));
        _this.addRule0(axiomPattern("axiom (not phi -> not psi) -> (psi -> phi)", "(not phi -> not psi) -> (psi -> phi)"));
        _this.addRule2(rule2Pattern("modusPonens", "phi", "phi -> psi", "psi"));
        return _this;
    }
    return HilbertProofSystem;
}(ProofSystem));
export { HilbertProofSystem };
//# sourceMappingURL=HilbertProofSystem.js.map