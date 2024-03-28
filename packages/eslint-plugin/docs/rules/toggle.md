# Toggle (`opticks/toggle`)

Detects stale code from expired Opticks experiments, and other common mistakes related to toggles.

## Rule Details

This rule aims to to guide users of Opticks to correct use of the library, as well as indicate which experiments in the code should be considered for clean up.

### Options

This rule expects a configuration to be present in order to detect experiments to be cleaned up.

```json
{
    "settings": {
        "opticks": {
            "experiments": {
                "foo": "a", 
                "bar": null, 
                "baz": "b"
            }
        }
    }
}
```

By convention, the value of an experiment of `null` means the experiment is still running, and a string value such as `a` or `b` means it's concluded to the side specified and the other sides can be cleaned up.

## When Not To Use It

If you don't use Opticks.
