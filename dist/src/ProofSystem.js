var ProofSystem = /** @class */ (function () {
    function ProofSystem() {
        this.rules0 = new Array();
        this.rules1 = new Array();
        this.rules2 = new Array();
        this.rules3 = new Array();
    }
    ProofSystem.ruleSuccess = function (msg, previous) {
        if (previous === void 0) { previous = []; }
        return { type: "success", msg: msg, previous: previous };
    };
    ProofSystem.defaultRuleSuccess = function () {
        return { type: "success", msg: "", previous: [] };
    };
    ProofSystem.ruleIssue = function (msg) {
        return { type: "issue", msg: msg };
    };
    ProofSystem.prototype.addRule0 = function (test) { this.rules0.push(test); };
    ProofSystem.prototype.addRule1 = function (test) { this.rules1.push(test); };
    ProofSystem.prototype.addRule2 = function (test) { this.rules2.push(test); };
    ProofSystem.prototype.addRule3 = function (test) { this.rules3.push(test); };
    /**
     *
     * @param proof
     * @param i, suchthat  proof.justifications[j] are filled for all j < i
     * @effect modifies proof.justifications[i]
     */
    ProofSystem.prototype.checkFormula = function (proof, i) {
        for (var _i = 0, _a = this.rules0; _i < _a.length; _i++) {
            var rule = _a[_i];
            var output = rule(proof.formulas[i]);
            if (output) {
                proof.justifications[i] = output;
                if (output.type == "success")
                    return;
            }
        }
        for (var _b = 0, _c = this.rules1; _b < _c.length; _b++) {
            var rule = _c[_b];
            if (rule(undefined, proof.formulas[i]))
                for (var j = 0; j < i; j++)
                    if (proof.formulas[j]) {
                        var output = rule(proof.formulas[j], proof.formulas[i]);
                        if (output) {
                            proof.justifications[i] = output;
                            if (output.type == "success") {
                                output.previous = [j];
                                return;
                            }
                        }
                    }
        }
        for (var _d = 0, _e = this.rules2; _d < _e.length; _d++) {
            var rule = _e[_d];
            if (rule(undefined, undefined, proof.formulas[i]))
                for (var j = 0; j < i; j++)
                    if (proof.formulas[j])
                        if (rule(undefined, proof.formulas[j], proof.formulas[i]))
                            for (var k = 0; k < j; k++)
                                if (proof.formulas[k]) {
                                    var output = rule(proof.formulas[k], proof.formulas[j], proof.formulas[i]);
                                    if (output) {
                                        proof.justifications[i] = output;
                                        if (output.type == "success") {
                                            output.previous = [k, j];
                                            return;
                                        }
                                    }
                                }
        }
        for (var _f = 0, _g = this.rules3; _f < _g.length; _f++) {
            var rule = _g[_f];
            for (var j = 0; j < i; j++)
                if (proof.formulas[j])
                    if (rule(undefined, undefined, proof.formulas[j], proof.formulas[i]))
                        for (var k = 0; k < j; k++)
                            if (proof.formulas[k])
                                if (rule(undefined, proof.formulas[k], proof.formulas[j], proof.formulas[i]))
                                    for (var l = 0; l < k; l++)
                                        if (proof.formulas[l]) {
                                            var output = rule(proof.formulas[l], proof.formulas[k], proof.formulas[j], proof.formulas[i]);
                                            if (output) {
                                                proof.justifications[i] = output;
                                                if (output.type == "success") {
                                                    output.previous = [k, j, l];
                                                    return;
                                                }
                                            }
                                        }
        }
        if (proof.justifications[i] == null)
            proof.justifications[i] = { type: "issue", msg: "does not match any rule" };
    };
    ProofSystem.prototype.checkProof = function (proof) {
        for (var i = 0; i < proof.length; i++)
            if (proof.formulas[i] && proof.justifications[i] == null)
                this.checkFormula(proof, i);
    };
    return ProofSystem;
}());
export { ProofSystem };
//# sourceMappingURL=ProofSystem.js.map