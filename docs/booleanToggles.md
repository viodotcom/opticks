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
- `toggle` toggles that switch between multiple experiment variants (a/b/c/...)

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

## Usage and Integrations

Currently Opticks has two 'integrations' or adapters, a simple one based on a
local key/value store, and one wrapping the Optimizely Full Stack SDK. Once
initialized, using/consuming the toggle decisions is the same.

In the future the integrations will be packaged separately so you can include
the one you need, for now the "simple" is the default and the Optimizely adapter
can be included directly via:
`import Opticks from 'opticks/lib/optimizely'`

## Integrations

### Simple

See the [Simple integration documentation](docs/simple-integration.md).

### Optimizely

See the [Optimizely integration documentation](docs/optimizely-integration.md).

## Boolean Toggles: Reading values

Let's take a look at Boolean Toggles first, as the name suggest, they are either
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

## Boolean Toggles: Executing code

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
values, we specify multiple variants of which one is active at any time.

## Multi Toggles: Reading values

```
// reading the toggle value
toggle(experimentId: string) => {variant: string}
```

```
// Defines the result if that toggle or experiment wins, either a function that
// will be executed, or any other value
type ToggleResultType = function | any

// do something for a/b/c side:
toggle(
  experimentId,
  variantA: ToggleResultType,
  variantB: ToggleResultType,
  ?variantC,
  ...
)
```

```
// simple boolean switch (you could use a BooleanToggle instead of course)
toggle('foo', false, true)

// 'black' is the default, red and green are variants to experiment with
toggle('foo', 'black', 'green', 'red')
```

## Multi Toggles: Executing code

As with Boolean Toggles, an approach that allows you to clean the code easier would be to encapsulate variations by executing code from the toggle:

```
const price = 100
const savings = 20

const CTA = toggle(
  'CTAWording',
  () => `Buy now for just ${price}` // variant a (default)
  () => `Buy now for ${price} and save ${savings}`, // variant b
  () => `From ${price + savings} to ${price}` // variant c
)
```

Then after running the cleaning codemods when b wins:

```
const price = 100
const savings = 20

const CTA = `Buy now for ${price} and save ${savings}`
```

## Removal of dead code

For instructions and recipes, see [Removal of dead code](docs/dead-code-removal.md).
