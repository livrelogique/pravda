
import { ProverComponent } from "./src/ProverComponent.js";

const provers = Array.from(document.getElementsByTagName("textarea"));
provers.forEach((prover) => new ProverComponent(prover) );