import { Formula, Term } from "./Formula.js";

export type Substitution = { [v: string]: Formula | Term; };

