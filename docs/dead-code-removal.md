# Removal of dead code

On of our goals is to make it easy to introduce _and_ remove experiment code.

We've written codemods to automatically prune 'losing' sides of our experiments,
and this works well if we organize our experiment code in a standardized way.

Let's look at concrete examples on how to introduce and (automatically) remove
and clean toggle code.

The codemods use different strategies to clean losing toggles and keep the
winners:

- winning values are kept
- for functions, the function body is kept

For the losing boolean toggles and losing multi toggle variants:

- losing toggles are pruned
- if the losing side is a JSXExpression, we clean it up including the variables
  that are referenced from there

The codemods are designed to prune toggles that are null, allowing you to
execute code only for one variant of a multi toggle experiment.

### What are codemods?

Codemods are AST -> AST transformers that we use to find toggles and remove
losing variants and keep the winning variants of your toggles.

We use JSCodeShift to do this, and Opticks ships with the codemods that you can
run from your project.

See [the JSCodeShift project](https://github.com/facebook/jscodeshift) for more
information.

## Running the codemods

There two codemods supplied with Opticks, one for Boolean Toggles, one for
Toggles, they can be found in the `src/transform` directory.

In order to clean all "losing" branches of the code, the codemods need to know
which toggle you're modifying, whether the toggle (for Boolean Toggles) or which
variation (for Multi Toggles) "won".

Assuming you're running the codemods directly from the Opticks directory in your
`node_modules`, to declare the `b` side of the `foo` Multi Toggle the winner and
prune all losing code in the `src` directory, run the script as follows:

```
npm run clean:toggle -- --toggle=foo --winner=b
```

Most likely you'd want to run the script your own project which consumes
Opticks, you can add the following to your npm scripts (in your package.json)
for convenience:

```
"scripts": {
  "clean:toggle": "npm explore opticks -- npm run clean:toggle `pwd`/src --dry -- ",
}
```

This will forward any parameters you pass towards the `clean:toggle` script
in the Opticks package with your project's src directory.

Then you can run it right from your project:

```
npm run clean:toggle -- --toggle=foo --winner=b
```

### Boolean Toggles

Boolean Toggle clean up works in a similar way, noting the winner accepts a
string value `'true'` or `'false'`:

```
npm run clean:booleanToggle -- --toggle=foo --winner='true'
```

### Overriding the library import settings

By default the codemods make assumptions on the name of the imports to clean,
namely:

```
import { booleanToggle } from 'opticks'
// or
import { toggle } from 'opticks'
```

You can override these values via:
`--functionName=myLocalNameForMultiOrBooleanToggle` and
`--packageName=myNameForOpticks`

## Cleaning Examples and Recipes

Simple variable substitution:

```
// during experiment:
const CTAColor = toggle('CTAColor', 'black', 'green', 'red')

// after 'b' was declared winner:
const CTAColor = 'red'
```

Conditional component rendering:

```
// simplified, somewhat naive example as it doesn't account for
// layout changes or conditional loading of the component

const SearchBox = toggle(
  'SearchBoxComponent',
  HorizontalSearchBox,
  VerticalSearchBox
)

// .. in render method: <SearchBox />
```

To get the toggle variant

```
const result = toggle('toggleFoo') // 'b'
```

A more interesting experiment would execute conditional code based on a multi
toggle. The trick here is that like Boolean Toggles, toggles accepts
functions that will be executed only for a particular experiment branch.

For example:

```
// during the experiment
const alwaysDoSomething = () => console.log('always')
const doSomething = (msg) => console.log('default', msg)
const doSomethingElse = (msg) => console.log('b', msg)

const handleOnClick = () => {
  alwaysDoSomething()
  toggle(
    'DoSomethingOnClick',
    () => doSomething('foo'), // default
    () => doSomethingElseForB('bar') // for b
  )
}

// after b is declared 'winner'
const alwaysDoSomething = () => console.log('always')
const doSomething = (msg) => console.log('default', msg)
const doSomethingElse = (msg) => console.log('b', msg)

const handleOnClick = () => {
  // execute only what's needed, but what about doSomething?
  alwaysDoSomething()
  doSomethingElse('bar')
}
```

As you can see the code execution is clean but there's a lingering function
`doSomething` that is never executed. In some cases this is OK (if the function
is used elsewhere), and likely won't impact the production build as the dead
code can be pruned build-time, but it's better if test-only code would be
removed from the source code.

There's different solutions to this problem, and the preferred approach depends
on the particular experiment.
One solution is to simply inline code that is only used in one branch of the
experiment:

```
// during the experiment
const alwaysDoSomething = () => console.log('always')

const handleOnClick = () => {
  alwaysDoSomething()
  toggle(
    'DoSomethingOnClick',
    () => console.log('default', 'foo'), // a / default
    () => console.log('b', 'bar') // for b
  )
}

// after b is declared 'winner'
const alwaysDoSomething = () => console.log('always')

const handleOnClick = () => {
  // cleaner end result, but inlined solution
  alwaysDoSomething()
  console.log('b', 'bar')
}
```

Our codemods are designed to prune branches with `null` allowing you to execute
code only for one side of a test:

```
// before
toggle(
  'ShowConfirmationDialogBeforeDoingSomething',
  null,
  () => showConfirmationDialog()
)
doSomething()

// if 'b' wins:
showConfirmationDialog()
doSomething()

// if 'a' wins:
doSomething()
```

As you can imagine, this also can be used to _not_ execute code as an
experiment. We sometimes use this to re-evaluate an existing component or piece
of business logic.

## Cleaning Toggles Examples

### Conditional rendering

The simplest way to render something conditionally is to assign a boolean to a
variable. Though this is probably better done with a boolean toggle, it's
possible with a toggle as well:

```
const shouldRenderIcon = toggle('SomethingWithIcon', false, true)

// in render:

<div>Foo {shouldRenderIcon && <Icon/>}</div>
```

This would leave a shouldRenderIcon after the experiment concluded. If this
bothers you, you can opt for an inline solution:

```
<div>Foo {toggle('SomethingWithIcon', null, <Icon/>)}</div>
```

Or make the icon configurable in a separate component:
// TODO: Check

```
<Component
  foo="bar"
  {toggle('ComponentWithIcon', null, () => ...{withIcon: true}}
/>
```

### Composition

While possible to make a Component switch at the 'consumer' level (eg the parent
component that will render the component), it's sometimes better to move the
toggle point to the component itself, consumers don't need to be aware the
component is being experimented on at all.

You can use composition to cleanly combine experimental code with existing
functions or components, such as with a Higher Order Component:

```
const withSomethingGreat = (Component) => // ... do something with the SearchBox

export default toggle(
    'GreaterSearchBox',
    SearchBox,
    () => withSomethingGreat(SearchBox)
  )
```

Obviously these are all rather simplified examples. In real life things get a
little messier, but with careful consideration, we've been able to keep our code
base relatively clean while running multiple experiments.

## Improvement points

### When using functions for variations

All functions in the toggles should be double arrow or bound functions, to
preserve the scope while executing winning toggles.

Since the winner implementation only and fully preserves the _body_ of the
winning function (it is statically analyzed, not executed), it's not advised to
return a value when using a function, as it can result in unexpected behavior
returning early.

## Coding Style Conventions

When the codemods rewrite your code, the resulting output might not match your
coding conventions such as the use of semicolons. This project doesn't attempt
to apply any pretty printing itself as your needs might vary from others. It is
recommended to run ESLint with the `--fix` option, Prettier, or another pretty
print tool after running the codemods to ensure uniformity in your codebase.

See https://github.com/benjamn/recast/issues/140#issuecomment-69794531 for more
details.

## Request For Comments

The codemods are in active development as it gains more in-the-wild usage,
please report your usage and/or issues so we can improve them alongside your
real world requirements.
