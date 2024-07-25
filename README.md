# Opticks Monorepo

Welcome to the Opticks monorepo! This repository includes three main packages:

- **lib:** (https://www.npmjs.com/package/opticks)
- **cli:** (https://www.npmjs.com/package/opticks-cli)
- **eslint-plugin:** (https://www.npmjs.com/package/eslint-plugin-opticks)

Each package has its own directory and corresponding README file with specific instructions and documentation.

## Table of Contents

- [Opticks Monorepo](#opticks-monorepo)
  - [Table of Contents](#table-of-contents)
  - [Setup](#setup)
  - [Building and Testing](#building-and-testing)
  - [Publishing Packages](#publishing-packages)

## Setup

To get started with the Opticks monorepo, ensure you have the following prerequisites installed:

- Node.js (version 20.8.0)
- Yarn

Clone the repository and install dependencies:

```bash
git clone https://github.com/viodotcom/opticks.git
cd opticks
yarn install
```

## Building and Testing

To build and test all packages, you can use the following Yarn commands:

```bash
# Build all packages
yarn workspaces foreach -A run build

# Test all packages
yarn workspaces foreach -A run test
```

## Publishing Packages

To publish a package after making changes, follow these steps:

1. **Generate a Changeset:**
   After making changes to a package, run the following command to generate a changeset:

   ```bash
   npx changeset
   ```

   Follow the prompts to describe your changes. This will create a changeset file in the `.changeset` directory.

2. **Push Your Changes:**
   Push your changes and create a pull request. Once the pull request is merged, a new pull request will be automatically created. This new pull request will remove the changeset file and update the changelog.

3. **Merge the Release Pull Request:**
   When this automatically created pull request is merged, the relevant package will be published to the npm registry.