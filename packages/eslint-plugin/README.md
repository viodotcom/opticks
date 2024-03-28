# eslint-plugin-opticks

Opticks

## Installation

You'll first need to install [ESLint](https://eslint.org/):

```sh
npm i eslint --save-dev
```

Next, install `eslint-plugin-opticks`:

```sh
npm install eslint-plugin-opticks --save-dev
```

## Usage

Add `opticks` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "opticks"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "opticks/toggle": "warn",
    }
}
```


For the opticks rules to work, you also need to add your `experiments` configuration settings section.

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

## Rules

* `opticks/toggle`: Detects stale code from expired Opticks experiments, and other common mistakes
