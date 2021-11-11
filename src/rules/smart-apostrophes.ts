import { AST } from "vue-eslint-parser";
import { Literal, Node } from "estree";
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
      if (!("value" in node)) return;

      const value = node.value;

      if (typeof value !== "string") return;

      const straightApostropheRegex = /(\p{Letter})(?:\\)?'(\p{Letter})/gu;
      if (!straightApostropheRegex.test(value)) return;

      context.report({
        node: node as Node,
        message: "Prefer the use of smart apostrophes (’).",
        fix(fixer) {
          const isLiteral = node.type === "Literal";
          const isVLiteral = node.type === "VLiteral";

          let text: string;
          if (isLiteral && "raw" in node) {
            // Remove string delimiters to avoid any potential issues with replacing quotes.
            text = node.raw.slice(1, node.raw.length - 1);
          } else {
            text = value;
          }

          let fixedText = text.replace(
            straightApostropheRegex,
            (_, a, b) => `${a}’${b}`
          );
          if (isLiteral && "raw" in node) {
            // Add string delimiters back.
            fixedText =
              node.raw.charAt(0) +
              fixedText +
              node.raw.charAt(node.raw.length - 1);
          } else if (isVLiteral) {
            // VLiteral nodes require the fixed text to have string delimiters
            // even though their initial value don't have any.
            fixedText = `"${fixedText}"`;
          }

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
          VLiteral: (node: AST.VLiteral) => handle(node),
          VText: (node: AST.VText) => handle(node),
        },
        // Event handlers for <script> or scripts.
        {
          Literal: (node: AST.ESLintLiteral) => handle(node),
        }
      );
    }

    return {
      Literal: (node: Literal) => handle(node),
    };
  },
};

export default rule;
