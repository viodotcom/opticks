import format from 'prettier-eslint'

module.exports.parser = 'flow'

const ESLINT_CONFIG_PATH = '.eslintrc'

// TODO: Encapsulate
let root

export default function transformer (file, api) {
  const j = api.jscodeshift

  const newSource = j(file.source)
    .find(j.JSXAttribute, { value: { expression: { value: null } } })
    .forEach(path => {
      j(path).remove()
    })
    .toSource()

  try {
    return format({
      text: newSource,
      prettierOptions: {
        parser: 'flow'
      },
      filePath: eslintConfigPath || ESLINT_CONFIG_PATH
    })
  } catch (e) {
    console.error('file path', file.path)
    return newSource
  }
}
