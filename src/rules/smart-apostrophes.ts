import { AST } from "vue-eslint-parser";
import { Literal, Node } from "estree";
import { Rule } from "eslint";

const rule: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Suggests the use of smart apostrophes over straight ones.",
    },
    fixable: "code",
    schema: [],
  },
  create: (context) => {
    function handle(node: Node) {
      if (!("value" in node)) return;

      const value = node.value;

      if (typeof value !== "string") return;

      const straightApostropheRegex = /(\p{Letter})'(\p{Letter})/gu;
      if (!straightApostropheRegex.test(value)) return;

      context.report({
        node,
        message: "Use smart apostrophe instead of straight apostrophe.",
        fix(fixer) {
          const isLiteral = node.type === "Literal";

          let text: string;
          if (isLiteral) {
            // Remove string delimiters to avoid any potential issue with quote replacing.
            text = node.raw.slice(1, node.raw.length - 1);
          } else {
            text = value;
          }

          let fixedText = text.replace(
            straightApostropheRegex,
            (_, a, b) => `${a}’${b}`
          );

          if (isLiteral) {
            // Add string delimiters back.
            fixedText =
              node.raw.charAt(0) +
              fixedText +
              node.raw.charAt(node.raw.length - 1);
          }

          return fixer.replaceText(node, fixedText);
        },
      });
    }

    // TODO: Fix VLiteral and type issues.

    if (!context.parserServices.defineTemplateBodyVisitor)
      return {
        Literal: (node: Literal) => handle(node),
      };

    return context.parserServices.defineTemplateBodyVisitor(
      // Event handlers for <template>.
      {
        // @ts-ignore
        Literal: (node: AST.ESLintLiteral) => handle(node),
        // VLiteral: (node: AST.VLiteral) => handle(node),
        // @ts-ignore
        VText: (node: AST.VText) => handle(node),
      },
      // Event handlers for <script> or scripts.
      {
        // @ts-ignore
        Literal: (node: AST.ESLintLiteral) => handle(node),
      }
    );
  },
};

export default rule;
