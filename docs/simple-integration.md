# Simple Integration

## Initialization

Before the toggles can be read, we need to set them. This library doesn't
concern itself with generating a list of toggles or experiments, as there are
many libraries and services out there doing it well already. It should be easy
to write an adapter for whichever experimentation service or tool you're using.

## Boolean Toggles

### Setting Toggles

```
setBooleanToggles({ foo: true, bar: false })
```

## Multi Toggles

### Setting Toggles

```
setMultiToggles({ foo: { variant: a }, bar: { variant: 'b' } })
```

## Caching

Results are not cached, you can set new Toggles as you please.
