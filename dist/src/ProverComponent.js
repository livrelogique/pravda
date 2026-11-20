import { stringToProof } from "./Proof.js";
import { ResolutionProofSystem } from "./ResolutionProofSystem.js";
import { HilbertProofSystem } from './HilbertProofSystem.js';
import { NaturalDeduction } from './NaturalDeduction.js';
import { SequentCalculus } from './SequentCalculus.js';
import { stringToFormula } from './Formula.js';
import * as Utils from "./Utils.js";
import { proofToProofTreeLaTeX, askForMathJAX } from './LaTeX.js';
var NB_COLS_MIN = 40;
var ProverComponent = /** @class */ (function () {
    /**
     *
     * @param oldDomElement
    * transforms the HTML TextArea in a "ProverComponent"
     */
    function ProverComponent(oldDomElement) {
        var proofStringOriginal = oldDomElement.value;
        var proverElement = document.createElement("div");
        proverElement.setAttribute("class", "prover");
        oldDomElement.parentElement.replaceChild(proverElement, oldDomElement);
        var proofTextArea = document.createElement("textarea");
        var proofTreeArea = document.createElement("div");
        proofTreeArea.setAttribute("class", "proofTreeLaTeX");
        var proofLinesInput = proofStringOriginal.split("\n").map(function (line) { return line.trim(); });
        function getLineInput() {
            var lineInput = [];
            for (var i in proofLinesInput)
                if (proofLinesInput[i].indexOf("*") >= 0) {
                    lineInput[i] = proofLinesInput[i].replace("*", "");
                    proofLinesInput[i] = lineInput[i];
                }
            return lineInput;
        }
        var lineInput = getLineInput();
        var solutionProofString = proofLinesInput.map(function (line) { return line.replace("//", ""); }).join("\n");
        var isASolutionProvided = false;
        var initialProofString = proofLinesInput.map(function (line) {
            if (line.startsWith("//")) {
                isASolutionProvided = true;
                return "";
            }
            else
                return line;
        }).join("\n");
        function getGoal() {
            var s = solutionProofString.split("\n");
            //console.log("GOAL: " + s[s.length-2])
            try {
                return stringToFormula(s[s.length - 2]);
            }
            catch (e) {
                console.log("failed to create the prover component because issue in parsing the goal");
                return null;
            }
        }
        var goal = getGoal(); //oldDomElement.getAttribute("goal");
        var proofSystem;
        switch (oldDomElement.getAttribute("proofSystem")) {
            case "ResolutionProofSystem":
                proofSystem = new ResolutionProofSystem();
                break;
            case "HilbertProofSystem":
                proofSystem = new HilbertProofSystem();
                break;
            case "NaturalDeduction":
                proofSystem = new NaturalDeduction();
                break;
            case "SequentCalculus":
                proofSystem = new SequentCalculus();
                break;
            default: proofSystem = new HilbertProofSystem();
        }
        proofTextArea.rows = proofLinesInput.length;
        proofTextArea.cols = NB_COLS_MIN;
        proofTextArea.setAttribute("class", "proof");
        proofTextArea.value = initialProofString;
        proverElement.appendChild(proofTextArea);
        var justificationsElement = document.createElement("div");
        justificationsElement.setAttribute("class", "justifications");
        proverElement.appendChild(justificationsElement);
        var buttonPanel = document.createElement("div");
        buttonPanel.setAttribute("class", "buttonPanel");
        proverElement.appendChild(buttonPanel);
        function addButton(name, onclickEvent) {
            var button = document.createElement("BUTTON");
            button.innerHTML = name;
            button.setAttribute("class", name + "Button");
            button.onclick = onclickEvent;
            buttonPanel.appendChild(button);
            return button;
        }
        var buttonReset = addButton("reset", function () { proofTextArea.value = initialProofString; onInput(); compute(); });
        var buttonSolution = addButton("solution", function () { proofTextArea.value = solutionProofString; onInput(); compute(); });
        function createJustificationHTMLElement(just) {
            function numberArrayToString(array) {
                return (array.length == 0) ? "" : "(" + array.toString() + ")";
            }
            var justificationElement = document.createElement("div");
            if (just == null) {
                justificationElement.setAttribute("class", "justification");
                return justificationElement;
            }
            else if (just.type == "input") {
                justificationElement.setAttribute("class", "justification inputJustification");
                justificationElement.innerHTML = "input";
                return justificationElement;
            }
            else if (just.type == "issue") {
                justificationElement.setAttribute("class", "justification errorJustification");
                justificationElement.innerHTML = just.msg;
                return justificationElement;
            }
            else if (just.type == "success") {
                justificationElement.setAttribute("class", "justification ruleJustification");
                justificationElement.innerHTML = just.msg + numberArrayToString(just.previous.map(function (n) { return n + 1; }));
                return justificationElement;
            }
            else
                throw "error";
        }
        /**
         * @returns the text of the proof written by the student
         */
        function getCurrentProofString() {
            return proofTextArea.value;
        }
        /**
         * @returns true when the proposition of the student contains the goal
         */
        function isPropositionContainsGoal() {
            return getCurrentProofString().split("\n").find(function (line) {
                try {
                    return Utils.same(stringToFormula(line.trim()), goal);
                }
                catch (e) {
                    return false;
                }
            });
        }
        proverElement.appendChild(proofTreeArea);
        function compute() {
            var proof = stringToProof(getCurrentProofString());
            for (var i in lineInput)
                proof.setJustificationInputFor(i);
            proofSystem.checkProof(proof);
            justificationsElement.innerHTML = '';
            for (var _i = 0, _a = proof.justifications; _i < _a.length; _i++) {
                var just = _a[_i];
                justificationsElement.appendChild(createJustificationHTMLElement(just));
            }
            if (!isASolutionProvided || (isPropositionContainsGoal() && proof.isCorrect())) {
                proofTextArea.setAttribute("class", "proof win");
                buttonSolution.setAttribute("class", "hidden");
            }
            else {
                proofTextArea.setAttribute("class", "proof");
                buttonSolution.setAttribute("class", "solutionButton");
            }
            if (proof.isCorrect()) {
                proofTreeArea.innerHTML = "\\(" + proofToProofTreeLaTeX(proof) + "\\)";
                askForMathJAX();
            }
            else
                proofTreeArea.innerHTML = "";
        }
        function onInput() {
            var proofString = proofTextArea.value;
            var proofLines = proofString.split("\n");
            if (proofString == initialProofString)
                buttonReset.setAttribute("class", "hidden");
            else
                buttonReset.setAttribute("class", "resetButton");
            var changed = false;
            for (var i in lineInput) {
                if (proofLines[i] != lineInput[i])
                    changed = true;
                proofLines[i] = lineInput[i];
            }
            if (changed)
                proofTextArea.value = proofLines.join("\n");
            var m = 0;
            for (var _i = 0, proofLines_1 = proofLines; _i < proofLines_1.length; _i++) {
                var line = proofLines_1[_i];
                m = Math.max(m, line.length);
            }
            var numberOfLines = proofLines.length;
            proofTextArea.rows = numberOfLines;
            proofTextArea.cols = Math.max(m, NB_COLS_MIN);
        }
        proofTextArea.oninput = function () { onInput(); compute(); };
        onInput();
        compute();
    }
    return ProverComponent;
}());
export { ProverComponent };
//# sourceMappingURL=ProverComponent.js.map