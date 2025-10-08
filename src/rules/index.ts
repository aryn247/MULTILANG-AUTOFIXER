import { getPythonFixes } from "./pythonRules";
import { getJSFixes } from "./jsRules";
import { getjavaFixes } from "./javaRules";
import { getcppFixes } from "./cppRules";
import { getcFixes } from "./cRules";
import { getphpFixes } from "./phpRules";
import { getgoFixes } from "./goRules";
import { getrubyFixes } from "./rubyRules";
import { getrustFixes } from "./rustRule";

export function
getFixesforLanguage(languageId: string, code : string) {
  switch (languageId) {
    case "python" :
      return getPythonFixes(code);

    case "javascript":
    case " typescript":
      return getJSFixes(code);
    
    case "java":
      return getjavaFixes(code);

    case "cpp":
      return getcppFixes(code);

    case "c":
      return getcFixes(code);

    case "php":
      return getphpFixes(code);

    case "go":
      return getgoFixes(code);

    case "ruby":
      return getrubyFixes(code);

    case "rust":
      return getrustFixes(code);

    default:
      return[];
  }
}
