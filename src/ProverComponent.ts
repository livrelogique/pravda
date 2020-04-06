import { ProofSystem } from 'ProofSystem.js';
import { Proof, stringToProof, Justification } from "./Proof.js";
import { ResolutionProofSystem } from "./ResolutionProofSystem.js";
import { HilbertProofSystem } from './HilbertProofSystem.js';
import { NaturalDeduction } from './NaturalDeduction.js';
import { stringToFormula, Formula } from './Formula.js';
import * as Utils from "./Utils.js";


const NB_COLS_MIN = 40;

export class ProverComponent {


    constructor(oldDomElement: HTMLTextAreaElement) {
        const proofStringOriginal = oldDomElement.value;
        const proverElement = document.createElement("div");
        proverElement.setAttribute("class", "prover");

        oldDomElement.parentElement.replaceChild(proverElement, oldDomElement);

        const proofTextArea = <HTMLTextAreaElement>document.createElement("textarea");

        const proofLinesInput = proofStringOriginal.split("\n").map((line) => line.trim());


        function getLineInput(): string[] {
            let lineInput: string[] = [];

            for (let i in proofLinesInput) if (proofLinesInput[i].indexOf("*") >= 0) {
                lineInput[i] = proofLinesInput[i].replace("*", "");
                proofLinesInput[i] = lineInput[i];
            }

            return lineInput;
        }

        const lineInput = getLineInput();

        const solutionProofString = proofLinesInput.map((line) => line.replace("//", "")).join("\n");





        let isASolutionProvided = false;
        const initialProofString = proofLinesInput.map((line) => {
            if (line.startsWith("//")) {
                isASolutionProvided = true;
                return "";
            } else return line;
        }).join("\n");

        function getGoal(): Formula {
            let s = solutionProofString.split("\n");
            //console.log("GOAL: " + s[s.length-2])
            try {
                return stringToFormula(s[s.length - 2]);
            }
            catch (e) {
                console.log("failed to create the prover component because issue in parsing the goal");
                return null;
            }

        }
        const goal: Formula = getGoal();//oldDomElement.getAttribute("goal");

        let proofSystem: ProofSystem;

        switch (oldDomElement.getAttribute("proofSystem")) {
            case "ResolutionProofSystem": proofSystem = new ResolutionProofSystem(); break;
            case "HilbertProofSystem": proofSystem = new HilbertProofSystem(); break;
            case "NaturalDeduction": proofSystem = new NaturalDeduction(); break;
            default: proofSystem = new HilbertProofSystem();
        }


        proofTextArea.rows = proofLinesInput.length;
        proofTextArea.cols = NB_COLS_MIN;
        proofTextArea.setAttribute("class", "proof");
        proofTextArea.value = initialProofString;
        proverElement.appendChild(proofTextArea);

        const justificationsElement = document.createElement("div");
        justificationsElement.setAttribute("class", "justifications");
        proverElement.appendChild(justificationsElement);


        const buttonPanel = document.createElement("div");
        buttonPanel.setAttribute("class", "buttonPanel");
        proverElement.appendChild(buttonPanel);


        function addButton(name, onclickEvent) {
            let button = document.createElement("BUTTON");
            button.innerHTML = name;
            button.setAttribute("class", name + "Button");
            button.onclick = onclickEvent;
            buttonPanel.appendChild(button);
            return button;
        }

        const buttonReset = addButton("reset", () => { proofTextArea.value = initialProofString; onInput(); compute() });
        const buttonSolution = addButton("solution",
            () => { proofTextArea.value = solutionProofString; onInput(); compute() });


        function createJustificationHTMLElement(just: Justification) {
            const justificationElement = document.createElement("div");

            if (just == null) {
                justificationElement.setAttribute("class", "justification");
                return justificationElement;
            }
            else if (just.type == "input") {
                justificationElement.setAttribute("class", "justification inputJustification");
                justificationElement.innerHTML = "input";
                return justificationElement;
            }
            else if (just.type == "issue")
                justificationElement.setAttribute("class", "justification errorJustification");
            else if (just.type == "success")
                justificationElement.setAttribute("class", "justification ruleJustification");
            else
                throw "error";

            justificationElement.innerHTML = just.msg;
            return justificationElement;
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
            return getCurrentProofString().split("\n").find((line) => {
                try { return Utils.same(stringToFormula(line.trim()), goal); }
                catch (e) { return false; }
            });
        }

        function compute() {
            const proof: Proof = stringToProof(getCurrentProofString());

            for (let i in lineInput)
                proof.setJustificationInputFor(i);
            proofSystem.checkProof(proof);

            justificationsElement.innerHTML = '';
            for (let just of proof.justifications)
                justificationsElement.appendChild(createJustificationHTMLElement(just));

            if (!isASolutionProvided || (isPropositionContainsGoal() && proof.isCorrect())) {
                proofTextArea.setAttribute("class", "proof win");
                buttonSolution.setAttribute("class", "hidden");
            }
            else {
                proofTextArea.setAttribute("class", "proof");
                buttonSolution.setAttribute("class", "solutionButton");
            }

        }


        function onInput() {
            let proofString = proofTextArea.value;
            let proofLines = proofString.split("\n");

            if (proofString == initialProofString)
                buttonReset.setAttribute("class", "hidden");
            else
                buttonReset.setAttribute("class", "resetButton");

            let changed = false;
            for (let i in lineInput) {
                if (proofLines[i] != lineInput[i])
                    changed = true;
                proofLines[i] = lineInput[i];
            }

            if (changed)
                proofTextArea.value = proofLines.join("\n");

            let m = 0;
            for (let line of proofLines) {
                m = Math.max(m, line.length);
            }
            const numberOfLines = proofLines.length;
            proofTextArea.rows = numberOfLines;
            proofTextArea.cols = Math.max(m, NB_COLS_MIN);
        }



        proofTextArea.oninput = () => { onInput(); compute(); };
        onInput();
        compute();




    }
}
