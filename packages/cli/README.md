# Opticks CLI

## Usage

```shell
npx opticks-cli clean

// OR

npx opticks clean id=EXPERIMENT-ID winner=A|B
```

## Running locally

First you will need to install dependencies and build the CLI in watch mode

```shell
cd opticks
yarn install
cd packages/cli && yarn build:watch
```

In a separate terminal window, create a symlink for `opticks-cli`

```shell
cd opticks
npm link
```

Navigate to your consumer project and link `opticks-cli`

```shell
cd opticks-consumer-project
npm link opticks-cli

opticks-cli clean
```
