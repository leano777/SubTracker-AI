# SubTracker AI - Subscription Tracking Application

> A modern, AI-powered subscription tracking application built with React, TypeScript, and Supabase.

[![CI Status](https://github.com/yourusername/subtracker-ai/workflows/ci/badge.svg)](https://github.com/yourusername/subtracker-ai/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646CFF.svg)](https://vitejs.dev/)

## 📋 Project Overview

SubTracker AI is a comprehensive subscription management platform that helps users track, analyze, and optimize their recurring subscriptions. Built with modern web technologies, it features real-time synchronization, AI-powered insights, and a responsive design that works across all devices.

### ✨ Key Features

- 📊 **Dashboard Analytics**: Visual overview of spending patterns and subscription health
- 🤖 **AI Insights**: Smart recommendations for cost optimization
- 🔄 **Real-time Sync**: Cloud synchronization across devices via Supabase
- 📱 **Mobile Responsive**: Optimized for desktop, tablet, and mobile
- 🎨 **Modern UI**: Clean, intuitive interface with dark/light themes
- 📈 **Budget Management**: Set limits and track spending against budgets
- 🔔 **Smart Notifications**: Renewal reminders and budget alerts
- 📅 **Calendar View**: Visual timeline of upcoming payments
- 💳 **Payment Tracking**: Monitor different payment methods
- 📊 **Export/Import**: Data portability and backup options

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
- **Supabase** - Backend-as-a-Service (Database, Auth, Real-time)
- **PostgreSQL** - Database (via Supabase)
- **Row Level Security** - Data security

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
- **Supabase Account** - [Sign up here](https://supabase.com)

## 🚀 Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/subtracker-ai.git
cd subtracker-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Configure your Supabase credentials in `.env.local`:
   ```env
   # Supabase Configuration (Required)
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-public-anon-key
   
   # Optional Feature Flags
   VITE_ENABLE_ANALYTICS=false
   VITE_ENABLE_DEBUG_MODE=false
   VITE_ENABLE_EXPERIMENTAL_FEATURES=false
   
   # Development Settings
   VITE_APP_ENV=development
   ```

### 4. Supabase Setup

To get your Supabase credentials:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select existing
3. Go to **Settings** → **API**
4. Copy the **Project URL** and **anon public key**
5. Update your `.env.local` file

#### Database Schema (Optional)

The app will create necessary tables automatically. For manual setup, see `/supabase/migrations/`.

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

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
