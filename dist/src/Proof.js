import { stringToFormula } from "./Formula.js";
var Proof = /** @class */ (function () {
    function Proof() {
        this.formulas = new Array();
        this.lines = [];
        this.justifications = [];
    }
    Proof.prototype.setJustificationInputFor = function (i) {
        this.justifications[i] = { type: "input", msg: "", previous: [] };
    };
    Object.defineProperty(Proof.prototype, "length", {
        get: function () { return this.formulas.length; },
        enumerable: false,
        configurable: true
    });
    ;
    Proof.prototype.isCorrect = function () {
        for (var _i = 0, _a = this.justifications; _i < _a.length; _i++) {
            var justification = _a[_i];
            if (justification != null)
                if (justification.type != "input")
                    if (justification.type != "success")
                        return false;
        }
        return true;
    };
    return Proof;
}());
export { Proof };
export function stringToProof(str) {
    var proof = new Proof();
    var lines = str.split("\n");
    lines.push("");
    proof.lines = lines;
    for (var i in lines)
        if (lines[i] != "") {
            var pos = lines[i].indexOf("*");
            var formulaLine = void 0;
            if (pos < 0)
                formulaLine = lines[i];
            else
                formulaLine = lines[i].substr(0, pos - 1);
            formulaLine = formulaLine.trim();
            proof.justifications[i] = null;
            try {
                proof.formulas[i] = stringToFormula(formulaLine);
                if (pos >= 0)
                    proof.setJustificationInputFor(i);
            }
            catch (e) {
                proof.justifications[i] = { type: "issue", msg: "parsing error | " + e.message, previous: [] };
            }
        }
        else
            proof.justifications[i] = null;
    return proof;
}
//# sourceMappingURL=Proof.js.map