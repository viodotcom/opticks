// @flow

module.exports.parser = 'flow'

const PACKAGE_NAME = 'opticks'
const FUNCTION_NAME = 'toggle'

const isCurrentToggle = (currentToggleCallName, wantedToggleName) =>
  currentToggleCallName.toLowerCase() === wantedToggleName

const implementWinningToggle = (
  j,
  toggleName,
  winnerArgumentIndex,
  callExpression
) => {
  const node = callExpression.value
  const currentToggleCallName = node.arguments[0].value
  if (!isCurrentToggle(currentToggleCallName, toggleName)) return

  const callPath = j(callExpression)
  const winningArgument = node.arguments[winnerArgumentIndex]

  // function, use body
  if (winningArgument.type === 'ArrowFunctionExpression') {
    callPath.replaceWith(winningArgument.body)
  } else if (
    // null value, remove
    winningArgument.type === 'Literal' &&
    winningArgument.value === null
  ) {
    callPath.remove()
  } else {
    // use raw value
    callPath.replaceWith(node.arguments[winnerArgumentIndex])
  }
}

const findToggleCalls = (j, context, localName) =>
  context.closestScope().find(j.CallExpression, { callee: { name: localName } })

// 0 based index, a = 0, b = 1, c = 2 etc...
const getWinnerArgumentIndex = winnerCode =>
  winnerCode.charCodeAt(0) - 'a'.charCodeAt(0)

// $FlowFixMe: mixed ES6 and CommonJS exports due to flow parser type
export default function transformer (file, api, options) {
  const j = api.jscodeshift
  const { toggle, winner } = options
  const source = j(file.source)

  if (!toggle || !winner) return source.toSource()

  const packageName = options.packageName || PACKAGE_NAME
  const functionName = options.functionName || FUNCTION_NAME

  const toggleName = toggle.toLowerCase()
  const winnerArgumentIndex = getWinnerArgumentIndex(winner) + 1

  return (
    source
      // find imports to packageName
      .find(j.ImportDeclaration, { source: { value: packageName } })
      .forEach(importDef => {
        // find local imported names of the toggle calls
        j(importDef)
          .find(j.ImportSpecifier, {
            imported: { name: functionName }
          })
          .forEach(importSpecifier => {
            const localName = importSpecifier.value.local.name

            const findToggleCallsByLocalImportName = findToggleCalls.bind(
              null,
              j,
              j(importSpecifier),
              localName
            )

            const toggleCallModifier = implementWinningToggle.bind(
              null,
              j,
              toggleName,
              winnerArgumentIndex
            )

            // implement winners for toggle calls based on local scoped name
            findToggleCallsByLocalImportName().forEach(toggleCallModifier)

            const allTogglesRemoved =
              findToggleCallsByLocalImportName().length === 0

            // remove import if no toggles are left
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
