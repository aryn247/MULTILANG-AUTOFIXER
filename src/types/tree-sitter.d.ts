declare module "tree-sitter" {
  export default class Parser {
    setLanguage(language: any): void;
    parse(code: string): any;
  }
}
