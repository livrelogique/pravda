import { ProofSystem } from 'ProofSystem.js';
import { Proof, stringToProof } from "./Proof.js";
import { ResolutionProofSystem } from "./ResolutionProofSystem.js";
import { HilbertProofSystem } from './HilbertProofSystem.js';

export class ProverComponent {
    constructor(oldDomElement: HTMLTextAreaElement) {
        const proofStringOriginal = oldDomElement.value;
        const proverElement = document.createElement("DIV");
        proverElement.setAttribute("class", "prover");

        oldDomElement.parentElement.replaceChild(proverElement, oldDomElement);

        const proofTextArea = <HTMLTextAreaElement>document.createElement("TEXTAREA");

        let proofLinesInput = proofStringOriginal.split("\n").map((line) => line.trim());

        let lineInput: string[] = [];

        for (let i in proofLinesInput) {
            if (proofLinesInput[i].indexOf("*") >= 0) {
                lineInput[i] = proofLinesInput[i].replace("*", "");
                proofLinesInput[i] = lineInput[i];
            }
        }


        let solution = proofLinesInput.map((line) => line.replace("//", "")).join("\n");
        const proofString = proofLinesInput.map((line) => { if (line.startsWith("//")) return ""; else return line; }).join("\n");

        let goal = oldDomElement.getAttribute("goal");

        let proofSystem: ProofSystem;

        switch (oldDomElement.getAttribute("proofSystem")) {
            case "ResolutionProofSystem": proofSystem = new ResolutionProofSystem(); break;
            case "HilbertProofSystem": proofSystem = new HilbertProofSystem(); break;
            default: proofSystem = new HilbertProofSystem();
        }


        proofTextArea.rows = proofLinesInput.length;
        proofTextArea.cols = 60;
        proofTextArea.setAttribute("class", "proof");
        proofTextArea.value = proofString;
        proverElement.appendChild(proofTextArea);

        let justificationsElement = document.createElement("div");
        justificationsElement.setAttribute("class", "justifications");
        proverElement.appendChild(justificationsElement);


        const buttonPanel = document.createElement("DIV");
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

        let buttonReset = addButton("reset", () => { proofTextArea.value = proofString; onInput(); compute() });
        //addButton("submit", () => { compute(); });
        let buttonSolution = addButton("solution", () => { proofTextArea.value = solution; onInput(); compute() });


        function getJustification(just: string) {
            let justificationElement = document.createElement("div");

            if (just == "input")
                justificationElement.setAttribute("class", "justification inputJustification");
            else if (just.indexOf("???") >= 0)
                justificationElement.setAttribute("class", "justification errorJustification");
            else if (just != "")
                justificationElement.setAttribute("class", "justification ruleJustification");
            else
                justificationElement.setAttribute("class", "justification");

            if (just == "???")
                just = "does not match any rule";

            if (just.indexOf("parsing error") >= 0)
                just = "parsing error";

            justificationElement.innerHTML = just;
            return justificationElement;
        }

        function compute() {
            let proofString = proofTextArea.value;
            let proof: Proof = stringToProof(proofString);

            for (let i in lineInput)
                proof.setJustificationInputFor(i);
            proofSystem.checkProof(proof);

            justificationsElement.innerHTML = '';
            for (let just of proof.justification)
                justificationsElement.appendChild(getJustification(just));

            if ((proofString.split("\n").map((line) => line.trim()).indexOf(goal) >= 0) && proof.isCorrect()) {
                proofTextArea.setAttribute("class", "proof win");
                buttonSolution.hidden = true;
            }
            else {
                proofTextArea.setAttribute("class", "proof");
                buttonSolution.hidden = false;
            }
        }


        function onInput() {
            let proofString = proofTextArea.value;
            let proofLines = proofString.split("\n");

            let changed = false;
            for (let i in lineInput) {
                if (proofLines[i] != lineInput[i])
                    changed = true;
                proofLines[i] = lineInput[i];
            }

            if (changed)
                proofTextArea.value = proofLines.join("\n");

            const numberOfLines = proofLines.length;
            proofTextArea.rows = numberOfLines;
        }



        proofTextArea.oninput = () => { onInput(); compute(); };
        onInput();
        compute();




    }
}
