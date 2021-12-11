import { AST } from "vue-eslint-parser";
import { Literal, Node, TemplateElement } from "estree";
import { Rule } from "eslint";

const rule: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Prefer the use of smart apostrophes over straight ones.",
    },
    fixable: "code",
    schema: [],
  },
  create: (context) => {
    function handle(node: AST.Node | Node) {
      const text = context.getSourceCode().getText(node as Node);

      const straightApostropheRegex = /(\p{Letter})(?:\\)?'(\p{Letter})/gu;
      if (!straightApostropheRegex.test(text)) return;

      context.report({
        node: node as Node,
        message: "Prefer the use of smart apostrophes (’).",
        fix(fixer) {
          const fixedText = text.replace(
            straightApostropheRegex,
            (_, a, b) => `${a}’${b}`
          );

          return fixer.replaceText(node as Node, fixedText);
        },
      });
    }

    // Vue.js
    if (context.parserServices.defineTemplateBodyVisitor) {
      return context.parserServices.defineTemplateBodyVisitor(
        // Event handlers for <template>.
        {
          Literal: (node: AST.ESLintLiteral) => handle(node),
          TemplateElement: (node: AST.ESLintTemplateElement) => handle(node),
          VLiteral: (node: AST.VLiteral) => handle(node),
          VText: (node: AST.VText) => handle(node),
        },
        // Event handlers for <script> or scripts.
        {
          Literal: (node: AST.ESLintLiteral) => handle(node),
          TemplateElement: (node: AST.ESLintTemplateElement) => handle(node),
        }
      );
    }

    return {
      Literal: (node: Literal) => handle(node),
      TemplateElement: (node: TemplateElement) => handle(node),
    };
  },
};

export default rule;
