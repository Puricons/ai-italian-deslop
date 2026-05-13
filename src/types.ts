export type Severity = "error" | "warning" | "off";
export type Category = "orthography" | "punctuation" | "lexicon" | "structure";

export interface TextEdit {
  start: number;
  end: number;
  replacement: string;
}

export interface Diagnostic {
  rule: string;
  severity: "error" | "warning";
  line: number;
  col: number;
  length: number;
  message: string;
  suggestion?: string;
  fix?: TextEdit;
}

export interface RuleMeta {
  id: string;
  category: Category;
  severity: "error" | "warning";
  fixable: boolean;
  description: string;
  docsUrl?: string;
}

export interface LintContext {
  config: LintConfig;
  filePath?: string;
}

export interface Rule {
  meta: RuleMeta;
  check(text: string, ctx: LintContext): Diagnostic[];
  fix?(text: string, diagnostic: Diagnostic): string;
}

export interface LintConfig {
  rules: Record<string, Severity>;
  ignore: string[];
  lexicon?: {
    "custom-slop-phrases"?: string[];
  };
}

export interface Segment {
  text: string;
  start: number;
  isCode: boolean;
}
