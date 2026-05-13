import type { Rule } from "../types.js";
import { accentedWordsRule } from "./orthography/accented-words.js";
import { apostropheErrorsRule } from "./orthography/apostrophe-errors.js";
import { noDoubleHyphenRule } from "./punctuation/no-double-hyphen.js";
import { noEmDashRule } from "./punctuation/no-em-dash.js";
import { staccatoSentencesRule } from "./punctuation/staccato-sentences.js";
import { suspenseEllipsisRule } from "./punctuation/suspense-ellipsis.js";
import { slopPhrasesRule } from "./lexicon/slop-phrases.js";
import { overusedAdjectivesRule } from "./lexicon/overused-adjectives.js";
import { macaronicAnglicismsRule } from "./lexicon/macaronic-anglicisms.js";
import { roboticConnectorsRule } from "./structure/robotic-connectors.js";
import { parallelClicheRule } from "./structure/parallel-cliche.js";
import { listOveruseRule } from "./structure/list-overuse.js";

export const ALL_RULES: Rule[] = [
  accentedWordsRule,
  apostropheErrorsRule,
  noDoubleHyphenRule,
  noEmDashRule,
  staccatoSentencesRule,
  suspenseEllipsisRule,
  slopPhrasesRule,
  overusedAdjectivesRule,
  macaronicAnglicismsRule,
  roboticConnectorsRule,
  parallelClicheRule,
  listOveruseRule,
];

export function getRuleById(id: string): Rule | undefined {
  return ALL_RULES.find((r) => r.meta.id === id);
}
