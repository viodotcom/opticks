# Boolean Toggles

## Boolean Toggles: Reading values

Boolean Toggles as the name suggest, are either on or off.

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
