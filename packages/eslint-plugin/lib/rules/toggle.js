/**
 * @fileoverview Opticks
 * @author Jop
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Detects stale code from expired Opticks experiments",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: "code",
    hasSuggestions: true,
    schema: [], // Add a schema if the rule has options
    messages: {
      ExperimentNotConfigured:
        "Looks like this experiment is not configured. Please make sure the experiment is added to the experiments config file.",
      ExperimentConcluded:
        "Looks like this experiment concluded, and can be cleaned up. The winning variant is {{winningVariant}}.",
      AddWinningVariant:
        "If the experiment is concluded, add the winning variant.",
      VariableAssignment:
        "It is okay to assign the result of a toggle to a variable, but you might be better off calling the toggle inline for automatic clean up.",
      InvalidNrOfVariants:
        "Invalid number of variants. Toggles require either 0, 2, or more variants.",
      AddNullBVariant:
        "If the b side is not supposed to do anything, add a null value.",
    },
  },

  create(context) {
    // QUESTION it seems the test runner reads from `context.settings`
    // while .eslintrc.js reads from `settings`
    const settings = context.settings || settings;
    const { opticks } = settings;
    // variables should be defined here

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    // any helper functions should go here or else delete this section

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      CallExpression: (node) => {
        const {
          callee: { name },
        } = node;
        // TODO: look for imported toggles from opticks only
        if (name === "toggle") {
          if (node.arguments.length === 2) {
            return context.report({
              messageId: "InvalidNrOfVariants",
              node,
              suggest: [
                {
                  messageId: "AddNullBVariant",
                  fix: (fixer) => {
                    const { range } = node;
                    // TODO: How to work with multilines
                    return fixer.insertTextBeforeRange(
                      [range[1] - 1],
                      ", null"
                    );
                  },
                },
              ],
            });
          }
          // Clean up
          const winningVariant = opticks.experiments[node.arguments[0].value];

          if (typeof winningVariant === 'undefined') {
            return context.report({
              messageId: "ExperimentNotConfigured",
              node
            });
          }

          // TODO: Support unlimited amount of arguments
          // TODO: Support arrow function replacement
          const winningVariantIndex = winningVariant === "a" ? 1 : 2;
          const winningVariantContent = node.arguments[winningVariantIndex].raw;

          if (typeof winningVariant === "string") {
            return context.report({
              messageId: "ExperimentConcluded",
              data: { winningVariant },
              node,
              suggests: [
                {
                  messageId: "AddWinningVariant",
                  fix: (fixer) => {
                    // TODO: Add tests
                    console.log(winningVariantContent);
                    return fixer.replaceText(node, winningVariantContent);
                  },
                }
              ],
            });
          }

          // Discourage variable assignment
          if (node.parent.type === "VariableDeclarator") {
            return context.report({
              messageId: "VariableAssignment",
              node,
            });
          }
        }
      },
      // visitor functions for different types of nodes
    };
  },
};
