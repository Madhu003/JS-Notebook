# 📓 JS-Notebook

> A powerful, browser-based interactive coding environment for JavaScript, TypeScript, and React with real-time execution, NPM package integration, and cloud synchronization.

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.2-blue.svg)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.7.1-orange.svg)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## ✨ Features

### 🎯 Core Capabilities
- **Multiple Language Support**: JavaScript, TypeScript, React (JSX/TSX), and Markdown
- **Real-time Execution**: Run code instantly with live output visualization
- **NPM Package Integration**: Install and use any NPM package from unpkg.com CDN
- **Monaco Editor**: Professional code editing with IntelliSense, syntax highlighting, and auto-completion
- **Code Snippets**: Save and reuse code snippets across notebooks
- **Cloud Sync**: Save notebooks to Firebase with real-time synchronization

### 🚀 Advanced Features
- **React Preview**: Live React component rendering with error boundaries
- **Babel Transpilation**: Automatic JSX/TSX to JavaScript transpilation
- **DnD Reordering**: Drag-and-drop cells to reorganize your notebook
- **Dark/Light Theme**: Eye-friendly themes with Monaco editor integration
- **Keyboard Shortcuts**: Boost productivity with extensive shortcuts
- **Editor Settings**: Customizable font size, minimap, line numbers, and more
- **Output Visualization**: Formatted console output with syntax highlighting

### 📦 Package Manager
- **Dynamic NPM Installation**: Install packages on-the-fly without npm install
- **Popular Packages Tab**: Quick access to lodash, axios, date-fns, uuid, and more
- **Version Support**: Install specific package versions
- **Persistent Storage**: Installed packages saved in localStorage
- **Global Access**: Packages available via window object
- **Firebase Integration**: Centralized popular packages list

### 🎨 User Experience
- **Responsive Design**: Works seamlessly on desktop and tablet
- **Inline Editing**: Edit notebook titles directly
- **Auto-save**: Changes automatically synced to cloud
- **Error Handling**: Graceful error messages and recovery
- **Authentication**: Secure Google Sign-In with Firebase Auth

## 🛠️ Tech Stack

- **Frontend**: React 18.2 with TypeScript
- **Styling**: Tailwind CSS with custom utilities
- **Code Editor**: Monaco Editor (VS Code engine)
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Build Tool**: Vite
- **Code Execution**: Babel Standalone
- **UI Components**: Material-UI Icons
- **State Management**: React Context API + React Query
- **Drag & Drop**: react-beautiful-dnd

## 📋 Prerequisites

- Node.js 18+ and npm 9+
- Firebase account and project
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Madhu003/JS-Notebook.git
cd JS-Notebook
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Google Sign-In)
3. Create a Firestore database
4. Get your Firebase configuration
5. Create `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Firestore Security Rules

Update your Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Notebooks - user can only access their own
    match /notebooks/{notebookId} {
      allow read, write: if request.auth != null && 
                         request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
                    request.auth.uid == request.resource.data.userId;
    }
    
    // Snippets - user can only access their own
    match /snippets/{snippetId} {
      allow read, write: if request.auth != null && 
                         request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
                    request.auth.uid == request.resource.data.userId;
    }
    
    // Popular packages - public read
    match /popularPackages/{packageId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 5. Seed Popular Packages (One-time)

After first run, seed the popular packages collection:

```javascript
// In browser console
import { popularPackagesService } from './services/popularPackagesService';
await popularPackagesService.seedDefaultPackages();
```

### 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 7. Build for Production

```bash
npm run build
npm run preview
```

## 📚 Usage Guide

### Creating a Notebook

1. Sign in with Google
2. Click "New Notebook" button
3. Add cells using the "+" dropdown
4. Choose cell type: JavaScript, TypeScript, React, or Markdown
5. Write code and press `Cmd/Ctrl + Enter` to execute

### Installing NPM Packages

1. Click the green **"Packages"** button in any editor
2. Choose from Popular packages or search for any NPM package
3. Click "Install"
4. Use the package in your code:

```javascript
const _ = window.lodash;
const chunked = _.chunk([1, 2, 3, 4], 2);
console.log(chunked); // [[1, 2], [3, 4]]
```

### Using Code Snippets

1. Click "Snippets" button
2. Create a new snippet with name, description, and code
3. Insert snippets into any cell with autocomplete

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + Enter` | Run current cell |
| `Cmd/Ctrl + S` | Save notebook |
| `Cmd/Ctrl + Shift + F` | Format code |
| `Cmd/Ctrl + /` | Toggle comment |
| `Cmd/Ctrl + D` | Duplicate selection |

## 🏗️ Project Structure

```
JS-Notebook/
├── src/
│   ├── components/          # React components
│   │   ├── atomic/         # Atomic design components
│   │   │   ├── atoms/      # Basic UI elements
│   │   │   └── molecules/  # Composite components
│   │   ├── ReactEditor/    # React code editor
│   │   ├── JavaScriptEditor/ # JS/TS code editor
│   │   ├── PackageManager/ # NPM package manager UI
│   │   └── SnippetManager/ # Code snippets management
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts      # Authentication hook
│   │   ├── useTheme.ts     # Theme management
│   │   ├── useSnippets.ts  # Snippets hook
│   │   └── usePackageManager.ts # Package management
│   ├── services/           # Business logic & API
│   │   ├── firebase.ts     # Firebase configuration
│   │   ├── authService.ts  # Authentication service
│   │   ├── notebookService.ts # Notebook CRUD
│   │   ├── snippetService.ts  # Snippets CRUD
│   │   ├── packageManager.ts  # NPM package loading
│   │   └── popularPackagesService.ts # Popular packages
│   ├── types/              # TypeScript definitions
│   │   ├── models/         # Data models
│   │   ├── services/       # Service interfaces
│   │   └── components/     # Component props
│   ├── constants/          # Constants and configs
│   ├── utils/              # Utility functions
│   └── App.tsx             # Root component
├── public/                 # Static assets
├── firestore.rules         # Firestore security rules
└── package.json            # Dependencies
```

## 🎨 Theming

The app supports dark and light themes with Monaco editor integration:

```typescript
import { useTheme, Theme } from './hooks/useTheme';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className={theme === Theme.Dark ? 'dark' : 'light'}>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

## 🔧 Configuration

### Editor Settings

Customize Monaco editor via UI or programmatically:

```typescript
const { settings, updateSetting } = useEditorSettingsContext();

updateSetting('fontSize', 16);
updateSetting('minimap', false);
updateSetting('lineNumbers', true);
```

### Available Settings
- Font size (10-24px)
- Line numbers (on/off)
- Minimap (on/off)
- Word wrap (on/off)
- Tab size (2-8 spaces)
- Theme (VS Light, VS Dark, Monokai, Dracula, etc.)

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linter
npm run lint
```

## 📦 Available NPM Packages

Popular packages ready to install:
- **lodash** - Utility functions (`window._`)
- **axios** - HTTP client (`window.axios`)
- **date-fns** - Date utilities (`window.dateFns`)
- **uuid** - UUID generator (`window.uuid`)
- **dayjs** - Date library (`window.dayjs`)
- **ramda** - Functional programming (`window.R`)

Plus any package from NPM via unpkg.com!

## 🎯 Use Cases

### 1. Interactive Learning
- Create interactive JavaScript tutorials
- Practice coding exercises
- Experiment with code snippets

### 2. Documentation
- Write technical documentation with live code examples
- Create API usage guides
- Document code behavior with real outputs

### 3. Prototyping
- Quick experimentation with new ideas
- Test JavaScript/TypeScript code snippets
- Debug complex functions with immediate feedback

### 4. Data Visualization
- Create and test data visualization code
- Interactive data analysis
- Real-time chart and graph generation

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Powerful code editor
- [Babel](https://babeljs.io/) - JavaScript compiler
- [Firebase](https://firebase.google.com/) - Backend infrastructure
- [React](https://reactjs.org/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [unpkg](https://unpkg.com/) - CDN for NPM packages

## 📞 Support

For issues and questions:
- Open an [issue](https://github.com/Madhu003/JS-Notebook/issues)
- Star the repo if you find it useful!

## 🗺️ Roadmap

- [ ] Collaborative editing
- [ ] Export notebooks (PDF, HTML, JSON)
- [ ] Import/Export code cells
- [ ] Version history
- [ ] Custom themes
- [ ] Plugin system
- [ ] Terminal integration
- [ ] Python/Node.js support

---

**Made with ❤️ by [Madhu003](https://github.com/Madhu003)**

Just as Python has Jupyter Notebook for interactive computing, JS-Notebook brings the same powerful concept to JavaScript development!
