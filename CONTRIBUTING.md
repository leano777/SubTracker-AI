# Contributing to SubTracker-AI

Thank you for considering contributing to SubTracker-AI! This document provides guidelines and instructions for contributing to this project.

## 🤝 Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). By participating, you are expected to uphold this code.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Git

### Setting up the Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/SubTracker-AI.git
   cd SubTracker-AI
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## 📝 Contribution Guidelines

### Conventional Commits

We use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, missing semi-colons, etc.)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Build process or auxiliary tool changes

**Example:**
```
feat: add subscription budget tracking feature

- Add budget allocation component
- Implement monthly spending limits
- Include overspend notifications
```

### Branch Naming Convention

- `feature/description` - For new features
- `fix/description` - For bug fixes
- `docs/description` - For documentation updates
- `refactor/description` - For code refactoring

### Pull Request Process

1. Create a new branch from `main`
2. Make your changes following our coding standards
3. Add or update tests as needed
4. Update documentation if required
5. Ensure all tests pass locally
6. Submit a Pull Request using our PR template

### Code Style

- Use TypeScript for all new code
- Follow the existing code style and patterns
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Ensure code is properly formatted (Prettier will handle this)

## 🧪 Testing

- Write unit tests for new features
- Ensure all existing tests continue to pass
- Run tests locally before submitting PR:
  ```bash
  npm run test
  ```

## 🐛 Reporting Bugs

Use our [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.yml) when reporting bugs. Include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser/environment details
- Screenshots if applicable

## 💡 Suggesting Features

Use our [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.yml) for new feature suggestions. Include:

- Problem description
- Proposed solution
- Alternative solutions considered
- Additional context

## 📚 Project Structure

```
src/
├── components/          # React components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── styles/             # CSS and styling
├── contexts/           # React contexts
└── test/              # Test files
```

## 🔧 Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## ❓ Questions?

If you have questions that aren't covered in this guide:

1. Check existing [Issues](https://github.com/leano777/SubTracker-AI/issues)
2. Create a new discussion
3. Reach out to the maintainers

## 🏆 Recognition

Contributors will be recognized in our README and release notes. Thank you for helping make SubTracker-AI better!
