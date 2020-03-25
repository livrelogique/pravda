import { ProofSystem } from "./ProofSystem.js";
import { axiomPattern, rule2Pattern } from "./PatternMatching.js";


export class HilbertProofSystem extends ProofSystem {
    constructor() {
        super();
        this.addRule0(axiomPattern("phi -> psi -> phi", "phi -> psi -> phi"));
        this.addRule0(axiomPattern("axiom (phi -> (psi -> eta)) -> ((phi -> psi) -> (phi -> eta))", "(phi -> (psi -> eta)) -> ((phi -> psi) -> (phi -> eta))"));
        this.addRule0(axiomPattern("axiom (not phi -> not psi) -> (psi -> phi)", "(not phi -> not psi) -> (psi -> phi)"));
        this.addRule2(rule2Pattern("modusPonens", "phi", "phi -> psi", "psi"));
    }

}

