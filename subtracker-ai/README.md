# SubTracker AI - Personal Financial Dashboard

> A comprehensive personal financial management platform with subscription tracking, budget pods, investment portfolio, and financial notebooks.

[![CI Status](https://github.com/leano777/SubTracker-AI/workflows/ci/badge.svg)](https://github.com/leano777/SubTracker-AI/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646CFF.svg)](https://vitejs.dev/)

## 🏦 Project Overview

SubTracker AI has evolved into a comprehensive personal financial dashboard that combines subscription management with advanced budgeting, investment tracking, and financial planning tools. Built with modern web technologies and featuring a mobile-first responsive design.

### 🎯 Core Financial Modules

#### 💳 **Subscription Management**
- Smart subscription tracking with enhanced categorization
- Watchlist for potential subscriptions with detailed evaluation notes
- Thursday paycheck optimization with pay period calculator
- Advanced form design with quick templates and cost analysis

#### 🏦 **Budget Pods System** *(NEW)*
- Monthly budget allocation into targeted "pods" (Vehicle, Rent, Food, Subscriptions, Emergency)
- Real-time balance tracking with contribution/withdrawal history
- Auto-transfer settings and smart warning thresholds
- Visual progress indicators and priority management

#### 📈 **Investment Portfolio** *(NEW)*
- Multi-platform investment tracking (Robinhood, Coinbase, Sequence, etc.)
- Real-time performance metrics with total return calculations
- Advanced filtering by platform, asset type, and performance
- Conviction and risk level tracking for investment decisions

#### 📚 **Financial Notebooks** *(NEW)*
- Rich note-taking system for investment thesis documentation
- Multiple notebook types: Investment Thesis, Strategy, Research, Plans, Reviews
- Task management with completion tracking and due dates
- Smart linking to investments, goals, and subscriptions

### ✨ Advanced Features

- 📊 **Smart Pay Period Calculator**: Thursday paycheck optimization with variance tracking
- 📱 **Mobile-First Design**: Quick-glance cards and thumb-friendly navigation
- 🎨 **Modern UI/UX**: Glass morphism, responsive design, and intuitive workflows
- 🔄 **Real-time Updates**: Seamless data flow between all financial modules
- 💾 **LocalStorage Persistence**: Reliable data storage with demo mode
- 🔍 **Advanced Search**: Cross-module search capabilities and filtering

## 🛠 Tech Stack

### Frontend
- **React 19.1** - UI framework with latest features
- **TypeScript 5.8** - Type-safe development
- **Vite 7.1** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Pre-built, accessible UI components
- **Radix UI** - Headless UI primitives
- **Recharts** - Data visualization library
- **Zustand** - State management
- **React Hook Form** - Form handling

### Backend & Services
- **LocalAuth Context** - Demo-friendly authentication system
- **LocalStorage** - Client-side data persistence
- **Zustand Persistence** - State management with middleware
- **Future: Supabase** - Backend-as-a-Service integration (Phase 4)
- **Future: PostgreSQL** - Database (via Supabase)
- **Future: API Integrations** - Sequence.io, Coinbase, Robinhood

### Development Tools
- **Vitest** - Testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **GitHub Actions** - CI/CD pipeline
- **Vercel** - Deployment platform

## 📋 Prerequisites

Before getting started, ensure you have:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** - Package manager
- **Git** - Version control

> **Note**: No external services required! The app runs completely offline with demo data.

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/leano777/SubTracker-AI.git
cd SubTracker-AI/subtracker-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5178`

### 4. Demo Mode

The app automatically loads with comprehensive demo data including:
- 📱 **8 Active Subscriptions** with realistic payment schedules
- 💰 **5 Budget Pods** with transaction history
- 📈 **3 Investment Holdings** with performance tracking  
- 📚 **4 Financial Notebooks** with investment research
- 🎯 **Financial Goals** and comprehensive notifications

Simply click **"Quick Start with Demo Account"** to explore all features!

## 🎯 Phase 3 Complete Features

### ✅ **Fully Functional Modules**
- 💳 **Enhanced Subscription Management** with watchlist and evaluation notes
- 🏦 **Budget Pods System** with 5 categories and auto-transfer settings
- 📈 **Investment Portfolio** with multi-platform tracking
- 📚 **Financial Notebooks** with rich documentation features
- 🧮 **Smart Pay Period Calculator** optimized for Thursday paychecks
- 📱 **Mobile-First Dashboard** with quick-glance financial cards

### 🔄 **Local Data Management**
- All data persisted in LocalStorage
- No external API dependencies
- Reliable demo experience
- Ready for Phase 4 API integrations

## 🌍 Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | ✅ | `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key | ✅ | `eyJ0eXAiOiJKV1Qi...` |
| `VITE_ENABLE_ANALYTICS` | Enable analytics tracking | ❌ | `true` |
| `VITE_ENABLE_DEBUG_MODE` | Show debug information | ❌ | `true` |
| `VITE_ENABLE_EXPERIMENTAL_FEATURES` | Enable beta features | ❌ | `true` |
| `VITE_APP_ENV` | Application environment | ❌ | `development` |

## 📜 Available Scripts

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format with Prettier
npm run type-check   # TypeScript type checking
npm run quality:check # Run all quality checks
```

### Testing
```bash
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:coverage # Run tests with coverage
npm run test:ui      # Open Vitest UI
npm run test:unit    # Run unit tests only
npm run test:integration # Run integration tests
npm run test:performance # Run performance tests
npm run test:ci      # Run tests for CI
```

### Git Hooks
```bash
npm run precommit    # Pre-commit checks (format, lint, test)
```

## 🐛 Debugging Tips

### Common Issues

1. **Build Errors**: Check TypeScript compilation with `npm run type-check`
2. **Supabase Connection**: Verify environment variables and network connection
3. **Styling Issues**: Clear browser cache and check Tailwind classes
4. **Performance**: Use React DevTools Profiler to identify bottlenecks

### Debug Mode

Enable debug mode for additional logging:
```env
VITE_ENABLE_DEBUG_MODE=true
```

### Browser DevTools

1. **React DevTools** - Component debugging
2. **Network Tab** - API request monitoring
3. **Console** - Error messages and logs
4. **Performance Tab** - Performance analysis

### Log Files

Check the following for error details:
- Browser console
- Network requests in DevTools
- Supabase dashboard logs

## 🗺️ Project Roadmap

### ✅ **Phase 1 - Foundation** (COMPLETED)
- [x] App architecture simplification  
- [x] Zustand state management implementation
- [x] Mobile-first dashboard design
- [x] Financial data type system

### ✅ **Phase 2 - Core Features** (COMPLETED)
- [x] Enhanced subscription forms with templates
- [x] Watchlist with detailed evaluation notes
- [x] Smart pay period calculator for Thursday paychecks
- [x] Comprehensive demo data integration

### ✅ **Phase 3 - Advanced Modules** (COMPLETED)
- [x] Budget Pods system with 5 categories
- [x] Investment Portfolio with multi-platform tracking
- [x] Financial Notebooks for investment documentation
- [x] Complete navigation integration

### 🔄 **Phase 4 - Polish & Forms** (IN PROGRESS)
- [ ] Complete investment creation forms
- [ ] Budget pod creation and management forms
- [ ] Notebook creation with rich text editor
- [ ] Enhanced mobile widgets for new modules

### 🔮 **Phase 5 - API Integration** (PLANNED)
- [ ] Sequence.io account connectivity
- [ ] Coinbase API for crypto portfolio sync
- [ ] Robinhood API for stock holdings
- [ ] Automated transaction categorization

### 🚀 **Phase 6 - Production** (FUTURE)
- [ ] Real-time data synchronization
- [ ] Advanced analytics and reporting
- [ ] Multi-user support and sharing
- [ ] Premium features and monetization

## 🚀 Deployment Workflow

### Vercel Deployment (Recommended)

1. **Connect Repository**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Import your GitHub repository

2. **Configure Environment**:
   - Add all required environment variables
   - Use production Supabase credentials

3. **Deploy**:
   - Vercel auto-deploys on push to main
   - Manual deploys via Vercel CLI: `vercel --prod`

### Manual Deployment

1. **Build**:
   ```bash
   npm run build
   ```

2. **Deploy** the `dist/` folder to your hosting provider

### CI/CD Pipeline

The project includes GitHub Actions workflows:
- **Continuous Integration** (`.github/workflows/ci.yml`)
- **Test Suite** (`.github/workflows/test.yml`)

Pipeline includes:
- ✅ Code linting and formatting
- ✅ TypeScript type checking
- ✅ Unit and integration tests
- ✅ Build verification
- ✅ Performance regression testing

### Production Checklist

- [ ] Environment variables configured
- [ ] Supabase production database set up
- [ ] SSL certificate enabled
- [ ] Performance monitoring set up
- [ ] Error tracking configured
- [ ] Backup strategy in place

## 📚 Additional Documentation

- [Contributing Guidelines](./CONTRIBUTING.md) - How to contribute
- [Debugging Plan](./DEBUGGING_PLAN.md) - Troubleshooting guide
- [Project Management](./project-management/README.md) - Development workflow
- [Testing Setup](./TESTING_SETUP_SUMMARY.md) - Test configuration

## 🆘 Support

If you encounter issues:

1. Check the [Debugging Plan](./DEBUGGING_PLAN.md)
2. Review [GitHub Issues](https://github.com/yourusername/subtracker-ai/issues)
3. Create a new issue with detailed information

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ by [Your Name]**

*Last updated: $(date)*
