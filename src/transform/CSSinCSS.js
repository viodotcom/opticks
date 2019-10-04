import format from 'prettier-eslint'

module.exports.parser = 'flow'

const PACKAGE_NAME = 'opticks'
const FUNCTION_NAME = 'toggle'
const ESLINT_CONFIG_PATH = '.eslintrc'

// TODO: Encapsulate
let root

// $FlowFixMe: mixed ES6 and CommonJS exports due to flow parser type
export default function transformer (file, api, options) {
  const j = api.jscodeshift
  const {
    eslintConfigPath,
    skipCodeFormatting
  } = options
  const source = j(file.source)

  // HACK to remove dangling ${} for template literals after clean up
  // TODO: Document why it is needed
  const wrapWithToggleRemovalComments = path => {
    const commentBefore = j.commentLine('TOGGLE_REMOVE', true, false)
    const commentAfter = j.commentBlock('TOGGLE_REMOVE', false, true)
    path.comments = path.comments || []
    path.comments.push(commentBefore)
    path.comments.push(commentAfter)
    return path
  }

  const isInsideCSSTemplateLiteral = path =>
    path.closest(j.TemplateLiteral).size() !== 0 &&
  path.closest(j.TaggedTemplateExpression, { tag: { name: 'css' } }).size() !== 0

  root = source

  const newSource = source
    .find(j.TaggedTemplateExpression, { tag: { name: 'css' } })
    .forEach(path => {
      if (isInsideCSSTemplateLiteral(j(path))) {
        const template = path.value.quasi
        // const src = '`' + j(path.node).toSource() + '`'
        // const lit = j.template.statement`src`  //j.templateLiteral(template.quasis, template.expressions)
        // const lit = j.template.statement  //j.templateLiteral(template.quasis, template.expressions)
        const lit = j.templateLiteral([...template.quasis], [...template.expressions])

        /*
        lit.comments = lit.comments || []
        lit.comments.push(j.commentLine('TOGGLE_REMOVE', true, false))
        lit.comments.push(j.commentBlock('TOGGLE_REMOVE', false, true))
        */
        j(path).replaceWith(
          wrapWithToggleRemovalComments(lit)
        )
      }
    })
    .toSource()

  // HACK to remove dangling ${} after clean up
  // TODO: remove CSS calls from AST instead of with comments
  const cleanSource = newSource
    .replace(/[\s]+\$\{\/\/TOGGLE_REMOVE[\s]+(css)?`/gm, '')
    .replace(/`\/\*TOGGLE_REMOVE\*\/}[\s]*/gm, '')

  if (skipCodeFormatting) {
    return cleanSource
  }

  try {
    return format({
      text: cleanSource,
      prettierOptions: {
        parser: 'flow'
      },
      filePath: eslintConfigPath || ESLINT_CONFIG_PATH
    })
  } catch (e) {
    console.error('file path', file.path)
    return cleanSource
  }
}
