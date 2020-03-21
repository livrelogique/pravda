import { ProofSystem } from 'ProofSystem.js';
import { Proof, stringToProof } from "./Proof.js";
import { ResolutionProofSystem } from "./ResolutionProofSystem.js";
import { HilbertProofSystem } from './HilbertProofSystem.js';

export class ProverComponent {
    constructor(oldDomElement: HTMLTextAreaElement) {
        const proofStringOriginal = oldDomElement.value;
        const domElement = document.createElement("DIV");
        domElement.setAttribute("class", "prover");

        oldDomElement.parentElement.replaceChild(domElement, oldDomElement);

        const proofElement = <HTMLTextAreaElement>document.createElement("TEXTAREA");

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


        proofElement.rows = proofLinesInput.length;
        proofElement.cols = 60;
        proofElement.setAttribute("class", "proof");
        proofElement.value = proofString;
        domElement.appendChild(proofElement);

        let justificationElement = <HTMLTextAreaElement>document.createElement("TEXTAREA");
        justificationElement.rows = proofLinesInput.length;
        justificationElement.cols = 60;
        justificationElement.setAttribute("readonly", "true");
        justificationElement.setAttribute("class", "justification");
        domElement.appendChild(justificationElement);


        const buttonPanel = document.createElement("DIV");
        buttonPanel.setAttribute("class", "buttonPanel");
        domElement.appendChild(buttonPanel);


        function addButton(name, onclickEvent) {
            let button = document.createElement("BUTTON");
            button.innerHTML = name;
            button.setAttribute("class", name + "Button");
            button.onclick = onclickEvent;
            buttonPanel.appendChild(button);
            return button;
        }

        let buttonReset = addButton("reset", () => { proofElement.value = proofString; onInput(); compute() });
        //addButton("submit", () => { compute(); });
        let buttonSolution = addButton("solution", () => { proofElement.value = solution; onInput(); compute() });




        function compute() {
            let proofString = proofElement.value;
            let proof: Proof = stringToProof(proofString);

            for (let i in lineInput)
                proof.setJustificationInputFor(i);
            proofSystem.checkProof(proof);
            justificationElement.value = proof.justification.join("\n");
            if ((proofString.split("\n").map((line) => line.trim()).indexOf(goal) >= 0) && proof.isCorrect()) {
                proofElement.setAttribute("class", "proof win");
                justificationElement.setAttribute("class", "justification win");
                buttonSolution.hidden = true;
            }
            else {
                proofElement.setAttribute("class", "proof");
                justificationElement.setAttribute("class", "justification");
                buttonSolution.hidden = false;
            }
        }


        function onInput() {
            let proofString = proofElement.value;
            let proofLines = proofString.split("\n");

            let changed = false;
            for (let i in lineInput) {
                if (proofLines[i] != lineInput[i])
                    changed = true;
                proofLines[i] = lineInput[i];
            }

            if (changed)
                proofElement.value = proofLines.join("\n");

            const numberOfLines = proofLines.length;
            proofElement.rows = numberOfLines;
            justificationElement.rows = numberOfLines;
            justificationElement.value = "";
        }

        

        proofElement.oninput = () => { onInput(); compute(); };
        onInput();
        compute();




    }
}
