// @flow

jest.autoMockOff()

const TestUtils = require('jscodeshift/dist/testUtils')
const defineTest = TestUtils.defineTest

describe('CSS-in-CSS cleanup', () => {
  defineTest(__dirname, 'CSSinCSS', {})
})
