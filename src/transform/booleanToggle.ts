/** @deprecated */
const PACKAGE_NAME = 'opticks'
const BOOLEAN_TOGGLE_FUNCTION_NAME = 'booleanToggle'

const isCurrentToggle = (currentToggleCallName, wantedToggleName) =>
  currentToggleCallName.toLowerCase() === wantedToggleName

const implementBooleanToggle = (j, isWinner: boolean, root, callExpression) => {
  const node = callExpression.value
  const [, ...variantArguments] = node.arguments

  const callPath = j(callExpression)

  const removeJSXExpressionContainer = (callExpression) => {
    const parentPath = callExpression.parentPath.value

    if (parentPath && parentPath.type === 'JSXExpressionContainer') {
      j(callExpression.parentPath).remove()
    }
  }

  const notOfType = (type, node) => j(node).closest(type).size() === 0

  const findUnusedReferencesOfType = (type, name) =>
    root
      .find(j.Identifier, {name})
      .filter(notOfType.bind(null, type))
      .size() === 0

  const removeUnusedReferences = (type, name, identifiers) =>
    root
      .find(type, identifiers)
      .filter(findUnusedReferencesOfType.bind(null, type, name))
      .remove()

  const removeCall = (callExpression) => {
    j(callExpression).remove()
    removeJSXExpressionContainer(callExpression)
  }

  const implementWinner = (callPath, winningArgument) => {
    // function, use body
    if (winningArgument.type === 'ArrowFunctionExpression') {
      callPath.replaceWith(winningArgument.body)
    } else if (
      winningArgument.type === 'Literal' &&
      winningArgument.value === null
    ) {
      removeCall(callExpression)
    } else {
      // use raw value
      callPath.replaceWith(winningArgument)
    }
  }

  switch (variantArguments.length) {
    // off / on configuration
    case 2: {
      implementWinner(callPath, variantArguments[isWinner ? 1 : 0])
      break
    }
    // on configuration
    case 1: {
      if (isWinner) {
        implementWinner(callPath, variantArguments[0])
      } else {
        removeCall(callExpression)

        j(variantArguments[0])
          .find(j.Identifier)
          .forEach((x) => {
            const name = x.value.name

            // Remove variable declarations
            removeUnusedReferences(j.VariableDeclarator, name, {
              id: {
                type: 'Identifier',
                name: name,
              },
            })

            // Remove imports
            removeUnusedReferences(j.ImportDeclaration, name, {
              specifiers: [
                {
                  local: {
                    name: name,
                  },
                },
              ],
            })
          })
      }
      break
    }
    // just the value
    default: {
      callPath.replaceWith(j.literal(isWinner))
    }
  }
}

const findBooleanToggleCalls = (j, context, localName) =>
  context.closestScope().find(j.CallExpression, {callee: {name: localName}})

// $FlowFixMe: mixed ES6 and CommonJS exports due to flow parser type
export default function transformer(file, api, options) {
  const j = api.jscodeshift
  const {toggle, winner} = options
  const source = j(file.source)

  if (typeof toggle === 'undefined' || typeof winner === 'undefined') {
    return source.toSource()
  }

  // TODO destruct
  const packageName = options.packageName || PACKAGE_NAME
  const functionName = options.functionName || BOOLEAN_TOGGLE_FUNCTION_NAME

  const toggleName = toggle.toLowerCase()
  const isWinner = winner === true || winner === 'true'

  return (
    source
      // find imports to packageName
      .find(j.ImportDeclaration, {source: {value: packageName}})
      .forEach((importDef) => {
        // find local imported names of the toggle calls
        j(importDef)
          .find(j.ImportSpecifier, {
            imported: {name: functionName},
          })
          .forEach((importSpecifier) => {
            const localName = importSpecifier.value.local.name

            const findToggleCallsByLocalImportName =
              findBooleanToggleCalls.bind(
                null,
                j,
                j(importSpecifier),
                localName,
              )

            const toggleCallModifier = implementBooleanToggle.bind(
              null,
              j,
              isWinner,
              source,
            )

            // transform toggle calls based on local scoped name
            findToggleCallsByLocalImportName()
              .filter((importCall) =>
                isCurrentToggle(importCall.node.arguments[0].value, toggleName),
              )
              .forEach(toggleCallModifier)

            const allTogglesRemoved =
              findToggleCallsByLocalImportName().length === 0

            // remove import if no toggle are left in the file
            if (allTogglesRemoved) {
              if (importDef.value.specifiers.length > 1) {
                // imports left, only remove toggle import specifiers
                j(importSpecifier).remove()
              } else {
                // no more imports left, remove the full import definition
                j(importDef).remove()
              }
            }
          })
      })
      .toSource()
  )
}
