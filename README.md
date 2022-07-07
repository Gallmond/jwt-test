## Quality of life

```
npm install --save-dev typescript eslint
tsc --init
npm init @eslint/config
```

## Configure TS
Set `tsconfig.json` root dir like: `"rootDir": "./src",`

## Configure ESLint
Open the workspace settings with "Open Workspace Settings (JSON)" in the command palette and add the below:

```json
"editor.codeActionsOnSave": {
  "source.fixAll.eslint": true
},
"eslint.validate": ["javascript"]
```

## Configure scripts
Add these to the package.json scripts:
```json
"test": "node ./src/index.js",
"watch": "tsc -w"
```

# Start coding!

Set TS going with `npm run watch`