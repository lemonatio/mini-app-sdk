# Mini App SDK

An SDK for integrating your Mini App with the Lemon Cash app.

## Install

Since the package is temporarily hosted on GitHub Packages, you need to configure authentication:

1. **Create a GitHub Personal Access Token (PAT)**:
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Generate a new token with `read:packages` permission
   - Copy the token

2. **Configure npm to use GitHub Packages**:
   Create a `.npmrc` file in your project root:
   ```ini
   @lemonatio:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
   ```

3. **Set the environment variable**:
   
   **Option A: Export in terminal** (temporary - only lasts until terminal is closed)
   ```bash
   export GITHUB_TOKEN=your_github_token_here
   ```
   
   **Option B: Add to your shell profile** (`.bashrc`, `.zshrc`, etc.)
   ```bash
   echo 'export GITHUB_TOKEN=your_github_token_here' >> ~/.bashrc
   source ~/.bashrc
   ```

### Install the package

```bash
npm install @lemonatio/mini-app-sdk
```

> **Note**: This is a temporary setup until we publish the package to npm. Once available on npm, you won't need the GitHub PAT configuration.

## Documentation

Visit the [documentation](https://lemoncash.mintlify.app/quickstart/quickstart) for a full walkthrough.