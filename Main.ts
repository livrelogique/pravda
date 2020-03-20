import { Proof, stringToProof } from "./src/Proof.js";
import { ResolutionProofSystem } from "./src/ResolutionProofSystem.js";


let proofSystem = new ResolutionProofSystem();

function update() {
    let proofString = (<HTMLTextAreaElement>document.getElementById("proof")).value;
    let proof: Proof = stringToProof(proofString);
    proofSystem.checkProof(proof);
    (<HTMLTextAreaElement>document.getElementById("justification")).value =
        proof.justification.join("\n");
    console.log(proof);
}

(<HTMLTextAreaElement>document.getElementById("proof")).onchange = update;
(<HTMLTextAreaElement>document.getElementById("proof")).onclick = update;
(<HTMLTextAreaElement>document.getElementById("proof")).onkeyup = update;


