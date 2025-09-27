# JS Notebook

A modern, interactive JavaScript notebook environment built with React and TypeScript - think Jupyter Notebook but for JavaScript!

## 🚀 Features

- **Interactive Code Execution**: Write and execute JavaScript/TypeScript code in isolated cells
- **Rich Markdown Support**: Create beautiful documentation with Markdown cells
- **Live Preview**: See your results instantly as you type
- **Code Editor Features**:
  - Syntax highlighting
  - Auto-completion
  - Error highlighting
  - Code formatting

## 🎯 Showcase

### Code Cell Example

Here's an example of a JavaScript code cell that creates a star pyramid:

```javascript
function printStarPyramid(height) {
    for (let i = 1; i <= height; i++) {
        // Add leading spaces
        let spaces = ' '.repeat(height - i);
        
        // Add stars
        let stars = '*'.repeat(i * 2 - 1);
        
        // Print the row
        console.log(spaces + stars);
    }
}
```

Output:

```text
    *
   ***
  *****
 *******
*********
```

### Markdown Support

The notebook supports rich Markdown formatting:

- **Bold text** for emphasis
- _Italicized text_ for subtle emphasis
- Headers of different levels
- Code blocks with syntax highlighting
- Lists and tables
- And much more!

### Use Cases

1. **Interactive Learning**
   - Create interactive JavaScript tutorials
   - Practice coding exercises
   - Experiment with code snippets

2. **Documentation**
   - Write technical documentation with live code examples
   - Create API usage guides
   - Document code behavior with real outputs

3. **Prototyping**
   - Quick experimentation with new ideas
   - Test JavaScript/TypeScript code snippets
   - Debug complex functions with immediate feedback

4. **Data Visualization**
   - Create and test data visualization code
   - Interactive data analysis
   - Real-time chart and graph generation

## Why JS Notebook?

Just as Python has Jupyter Notebook and Google Colab for interactive computing, JS Notebook brings the same powerful concept to JavaScript development. Whether you're:

- Learning JavaScript/TypeScript
- Prototyping code
- Creating interactive documentation
- Teaching programming concepts
- Experimenting with data visualization

JS Notebook provides an ideal environment for interactive JavaScript development.

## Getting Started

```bash
# Clone the repository
git clone https://github.com/Madhu003/JS-Notebook.git

# Install dependencies
npm install

# Start the development server
npm run dev
```

## 💡 Usage

1. Create new cells by clicking the '+' button
2. Choose between code and markdown cells
3. Write JavaScript/TypeScript code or Markdown content
4. Execute code cells to see results immediately
5. Save your notebook for later use

## 🛠️ Built With

- React
- TypeScript
- Vite
- Tailwind CSS
- Monaco Editor (Same editor as VS Code)

## Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create your feature branch
3. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Made with ❤️ by [Madhu003](https://github.com/Madhu003)

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
