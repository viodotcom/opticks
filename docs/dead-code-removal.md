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
- if the losing side is an JSXExpression, we clean it up including the variables
  that are referenced from there

The codemods are designed to prune toggles that are null, allowing you to
execute code only for one variant of an multi toggle experiment.

## Running the codemods

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
