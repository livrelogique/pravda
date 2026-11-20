import { ProverComponent } from "./src/ProverComponent.js";
var provers = Array.from(document.getElementsByTagName("textarea"));
provers.forEach(function (prover) { return new ProverComponent(prover); });
//# sourceMappingURL=Main.js.map