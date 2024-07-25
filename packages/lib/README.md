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

A toggle allows you to switch between multiple experiment variants (a/b/c/...)
and also turn functionality on or off (feature flags)

It can be used in a variety of ways:

1.  Reading the value of the toggle (boolean, or a/b/c for multi toggles )
1.  Execute code or for a variant of a multi toggle
1.  Execute code when a boolean toggle is on

We use React at vio.com and some of the code examples use JSX, but the code
and concept is compatible with any front-end framework or architecture.

### Opticks vs other experimentation frameworks

The main reason for using the Opticks library is to be able to clean your code
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

## Toggles

Toggles can be used to implement a/b/c style MVT testing and on/off feature flags as well.
We specify multiple variants of which only one is active at any time.
By convention the variants are named `a` (control), `b`, `c` etc.

### Reading values

While it's recommended to use the strategy described in
[executing code for variants](#executing-code-for-variants), the following shows
how the variant executing and code clean up works under the hood.

The simplest signature is as follows, to read the toggle value directly:

```
toggle(experimentId: string) => { variant: 'a' | 'b' | 'c' | 'd' | ... }
```

For example when the user is assigned to the `b` side:

```
const fooResult = toggle('foo')
if (fooResult === 'b') console.log('b side of the foo experiment')
```

This works fine, but will result in code that will be hard to clean up
automatically. Considering the codemods replace the toggle with the 'winning'
value (`b` in this case):

```
const fooResult = 'b'
if (fooResult === 'b') console.log('b variant of the foo experiment')
```

This would leave your code more messy than necessary. You could skip the
intermediate value but it will still result in awkward leftover code:

```
if (toggle('foo') === 'b') ...

// becomes
if ('b' === 'b') ...
// or
if ('a' === 'b') ...
```

Rather than reading the return value directly, you can map your variant to
arguments to the toggle function, like so:

```
// Defines the result if that toggle or experiment wins, either a function that
// will be executed, or any other value
type ToggleResultType = function | any

// do something for a/b/c variant:
toggle(
  experimentId,
  variantA: ToggleResultType,
  variantB: ToggleResultType,
  ?variantC: ToggleResultType,
  ...
)
```

The signature might look more complicated, but it allows you to define what the
results for your variants a, b, c etc map to. The first value is the
experimentId, then the values for `a`, `b`, etc.

For instance:

```
// simple boolean switch
const shouldDoSomething = toggle('foo', false, true)

// multiple variants as strings
// 'black' is the default, red and green are variants to experiment with
const buttonColor = toggle('foo', 'black', 'green', 'red')
```

The benefit is that after concluding your experiment, you can integrate the
winning variation's code directly without awkward references to `a` or `b` etc.

After you run the codemods to declare `b` the winner, the corresponding raw
value is kept:

```
const shouldDoSomething = toggle('foo', false, true)
const buttonColor = toggle('foo', 'black', 'green', 'red')

// becomes:
const shouldDoSomething = true
const buttonColor = 'green'
```

Much better already, but there is more room for improvement, especially if you
want to do things conditionally for a variant.

Consider the following set up:

```
const shouldShowWarning = toggle('shouldShowWarning', false, true)
if (shouldShowWarning) showWarning()

// or directly:
if (toggle('shouldShowWarning', false, true)) showWarning()
```

This would end up with an orphaned conditional after the codemods did their
cleaning:

```
const shouldShowWarning = true
if (shouldShowWarning) showWarning()

// or directly
if (true) showWarning()
```

The next section explains a more useful concept for this type of conditional
branching.

### Executing code for variants

A better approach that allows you to clean the code easier would be to
encapsulate variant logic by executing code from the toggle:

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

Then after running the cleaning codemods when the `b` variant wins:

```
const price = 100
const savings = 20

const CTA = `Buy now for ${price} and save ${savings}`
```

Or for an example of conditionally calling code:

```
alwaysDoSomething()
toggle('shouldShowWarning', null, () => shouldShowWarning())
```

This shows two special concepts of the codemods, passing a `null` and the use of
arrow functions.
Passing `null` allows for full clean up when that branch loses.
For winners, the _body_ of the arrow function is kept as-is.

After running the codemods with the winning `b` variant:

```
alwaysDoSomething()
shouldShowWarning() // no trace this was the result of a winning experiment
```

But if `a` would have won:

```
alwaysDoSomething()
// no trace that something was experimented with but lost
```

## Removal of dead code

Above are just a few examples of how the codemods operate on the code.
For instructions and more recipes, see
[Removal of dead code](docs/dead-code-removal.md).
