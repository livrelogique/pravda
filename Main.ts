
import { ProverComponent } from "./src/ProverComponent.js";


for(let i = 0; i < document.getElementsByTagName("prover").length; i++) {
    new ProverComponent(document.getElementsByTagName("prover")[i]);
}