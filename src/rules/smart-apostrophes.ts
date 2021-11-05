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
          const fixed = value.replace(
            straightApostropheRegex,
            (_, a, b) => `${a}’${b}`
          );
          const text =
            node.type === "Literal"
              ? `${node.raw.charAt(0)}${fixed}${node.raw.charAt(
                  node.raw.length - 1
                )}`
              : fixed;

          return fixer.replaceText(node, text);
        },
      });
    }

    // TODO: Fix VLiteral and type issues.

    if (!context.parserServices.defineTemplateBodyVisitor)
      return {
        Literal: (node: Literal) => handle(node),
      };

    return context.parserServices.defineTemplateBodyVisitor({
      // @ts-ignore
      Literal: (node: AST.ESLintLiteral) => handle(node),
      // VLiteral: (node: AST.VLiteral) => handle(node),
      // @ts-ignore
      VText: (node: AST.VText) => handle(node),
    });
  },
};

export default rule;
