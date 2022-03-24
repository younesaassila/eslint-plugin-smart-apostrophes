# eslint-plugin-smart-apostrophes

| **Deprecated** | Please use [eslint-plugin-curly-quotes](https://github.com/younesaassila/eslint-plugin-curly-quotes) instead. |
| -------------- | ------------------------------------------------------------------------------------------------------------- |

Prefer the use of smart apostrophes over straight ones. Supports `.js`, `.ts` and `.vue` files.

All contributions are welcome!

## Installation

Install ESLint:

```bash
npm install eslint --save-dev
```

Install `eslint-plugin-smart-apostrophes`:

```bash
npm install eslint-plugin-smart-apostrophes --save-dev
```

## Usage

Add the plugin to `.eslintrc.*`:

```json
{
  "plugins": ["smart-apostrophes"]
}
```

Add the rule:

```json
{
  "rules": {
    "smart-apostrophes/smart-apostrophes": "warn"
  }
}
```
