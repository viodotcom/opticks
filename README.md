Feature toggles and A/B tests are wonderful, but can easily introduce debt in
your codebase.

This project allows you to experiment and automatically clean up your JavaScript
experimentation code after the experiment concludes using JSCodeShift codemods.

The library consists of two related concepts:

- The Toggle library, a simple API for introducing toggles and A/B tests in your
  codebase
- Codemods for cleaning up toggle code

# Toggle Library

At the heart of our experimentation framework is the `toggle` function.

There are two types of toggles:

- `booleanToggle` toggles that turn functionality on or off (feature flags)
- `multiToggle` toggles that switch between multiple experiment variants (a/b/c/...)

It can be used in a variety of ways:

1.  Reading the value of the toggle (boolean, or a/b/c for multi toggles )
1.  Execute code when a boolean toggle is on
1.  Execute code or for a variant of a multi toggle

We use React at FindHotel and some of the code examples use JSX, but the code
and concept is compatible with any front-end framework or architecture.

### Opticks vs other experimentation frameworks

The main reason for using the `toggle` library is to be able to clean your code
afterwards by providing a predictable experimentation API.

We don't intend to reinvent the wheel and aim to keep it easy to integrate
existing frameworks and services such as Optimizely, LaunchDarkly and
Conductrics behind a simple facade.

## Toggle Clean Up

Let's look at concrete examples on how to introduce and (automatically) remove
and clean toggle code.

The codemods use different strategies to clean losing toggles and keep the
winners:

- winning values are kept
- for functions, the function body is kept

For the losing boolean toggles and losing multi toggle variants:

- losing toggles are pruned
- if the losing side is an JSXExpression, we clean it up including the variables
  that are referenced from there

The codemods are designed to prune toggles that are null, allowing you to
execute code only for one variant of an multi toggle experiment.

## Usage and Integrations

Currently Opticks has two 'integrations' or adapters, a simple one based on a
local key/value store, and one wrapping the Optimizely Full Stack SDK. Once
initialized, using/consuming the toggle decisions is the same.

In the future the integrations will be packaged separately so you can include
the one you need, for now the "simple" is the default and the Optimizely adapter
can be included directly via:
`import Opticks from 'opticks/lib/optimizely'`

## Initialization

TODO: This section describes both integrations, split when converting to
monorepo.

### Simple

Before the toggles can be read, we need to set them. This library doesn't
concern itself with generating a list of toggles or experiments, as there are
many libraries and services out there doing it well already. It should be easy
to write an adapter for whichever experimentation service or tool you're using.

### Setting Toggles

```
setBooleanToggles({ foo: true, bar: false })
```

### Setting Toggles

```
setMultiToggles({ foo: { variant: a }, bar: { variant: 'b' } })
```

### Optimizely

TODO: Document, for now see the unit tests on usage.

## Boolean Toggles: Reading values

Let's take a look at boolean toggles first, as the name suggest, they are either
on or off.

```
booleanToggle('shouldShowSomething') // true or false
```

While these are simple to implement, using them directly tends to create code
that's hard to clean up fully.

Consider the following toggle implementation:

```
// before
if (booleanToggle('foo')) foo()
if (booleanToggle('bar')) bar()
```

After the experiments concluded with `foo` winning and `bar` losing:

```
// after
if (true) foo()
if (false) bar() // never needed
```

While it works functionally, and code optimizers can eliminate any dead code
when generating a build, it still clutters your source code requiring manual
clean up efforts.

You could assign a variable to add semantics:

```
// before
const shouldShowWarning = booleanToggle('warningToggle')
// ...
shouldShowWarning && renderWarning()
```

After toggle is true:

```
// after
const shouldShowWarning = true
// ...
shouldShowWarning && renderWarning()
```

Slightly better, but it would be great if we can prune dead code altogether,
considering the following would remain if the flag is false:

```
// after
const shouldShowWarning = false
// ...
shouldShowWarning && renderWarning()
```

## Executing code for boolean toggle

You can pass a function to execute when a `toggle` is true. This can reduce the
amount of dangling leftover code after cleanup.

```
// before
always()
booleanToggle('warningToggle', () => renderWarning())
```

```
// after toggle is true
always()
renderWarning()
```

```
// after toggle is false
always()
```

## Multi Toggles

Multi toggles can be used to implement a/b/c style testing, instead of on/off
values, we assume variants that are labeled a (the default), b, c etc, of which
one is active at any time.

### Setting Toggles

```
setToggles({ foo: { variant: a }, bar: { variant: 'b' } })
```

Reading the value:

```
// reading the toggle value
multiToggle(experimentId: string) => {variant: string}
```

```
// Defines the result if that toggle or experiment wins, either a function that
// will be executed, or any other value
type ToggleResultType = function | any

// do something for a/b/c side:
multiToggle(
  experimentId,
  variantA: ToggleResultType,
  variantB: ToggleResultType,
  ?variantC,
  ...
)
```

```
// simple boolean switch (you could use a BooleanToggle instead of course)
multiToggle('foo', false, true)

// 'black' is the default, red and green are variants to experiment with
multiToggle('foo', 'black', 'green', 'red')
```

## Removal of dead code

On of our goals is to make it easy to introduce _and_ remove experiment code.
We've written codemods to automatically prune 'losing' sides of our experiments,
and this works well if we organize our experiment code in a standardized way.

### Running the codemods

TODO: Document

### Examples

Simple variable substitution:

```
// during experiment:
const CTAColor = multiToggle('CTAColor', 'black', 'green', 'red')

// after 'b' was declared winner:
const CTAColor = 'red'
```

Conditional component rendering:

```
// simplified, somewhat naive example as it doesn't account for
// layout changes or conditional loading of the component

const SearchBox = multiToggle(
  'SearchBoxComponent',
  HorizontalSearchBox,
  VerticalSearchBox
)

// .. in render method: <SearchBox />
```

To get the multi toggle variant

```
const result = multiToggle('multiToggleFoo') // 'b'
```

A more interesting experiment would execute conditional code based on a multi
toggle. The trick here is that like Boolean Toggles, Multi Toggles accepts
functions that will be executed only for a particular experiment branch.

For example:

```
// during the experiment
const alwaysDoSomething = () => console.log('always')
const doSomething = (msg) => console.log('default', msg)
const doSomethingElse = (msg) => console.log('b', msg)

const handleOnClick = () => {
  alwaysDoSomething()
  multiToggle(
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
  multiToggle(
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
multiToggle(
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

## Cleaning Multi Toggling Examples

### Conditional rendering

The simplest way to render something conditionally is to assign a boolean to a
variable. Though this is probably better done with a boolean toggle, it's
possible with a multiToggle as well:

```
const shouldRenderIcon = multiToggle('SomethingWithIcon', false, true)

// in render:

<div>Foo {shouldRenderIcon && <Icon/>}</div>
```

This would leave a shouldRenderIcon after the experiment concluded. If this
bothers you, you can opt for an inline solution:

```
<div>Foo {multiToggle('SomethingWithIcon', null, <Icon/>)}</div>
```

Or make the icon configurable in a separate component:
// TODO: Check

```
<Component
  foo="bar"
  {multiToggle('ComponentWithIcon', null, () => ...{withIcon: true}}
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

export default multiToggle(
    'GreaterSearchBox',
    SearchBox,
    () => withSomethingGreat(SearchBox)
  )
```

Obviously these are all rather simplified examples. In real life things get a
little messier, but with careful consideration, we've been able to keep our code
base relatively clean while running multiple experiments.

## Improvement points

All functions in the toggles should be double arrow functions, to preserve the
scope while executing winning toggles.
