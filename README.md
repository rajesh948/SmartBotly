# SmartBotly - AI WhatsApp Business Assistant

<div align="center">

![SmartBotly Logo](https://via.placeholder.com/150x150?text=SmartBotly)

**Complete SaaS solution for AI-powered WhatsApp business automation**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2+-61DAFB.svg)](https://reactjs.org/)

[Features](#features) • [Quick Start](#quick-start) • [Documentation](#documentation) • [Architecture](#architecture) • [Support](#support)

</div>

---

## 🌟 Overview

SmartBotly is a production-ready SaaS platform that enables businesses to automate their WhatsApp customer service using AI. Built with modern technologies and designed for scalability, it supports multiple clients, dynamic context injection, and seamless LLM provider switching.

### Key Highlights

✅ **Multi-tenant Architecture** - Support unlimited business clients
✅ **LLM Agnostic** - Switch between Claude, OpenAI, or add your own
✅ **Real-time Processing** - BullMQ powered async message handling
✅ **Smart Context Injection** - Dynamic prompts with products, FAQs, and history
✅ **Product Matching** - Fuse.js fuzzy search (Phase 2: Vector search ready)
✅ **Order Management** - AI creates orders from conversations
✅ **Admin & Client Portals** - Complete dashboards for all users
✅ **Production Ready** - Docker, CI/CD, logging, error handling

---

## 📁 Project Structure

```
smartbotly/
├── backend/                 # Node.js + TypeScript + Express
│   ├── src/
│   │   ├── config/         # Database, Redis, constants
│   │   ├── models/         # MongoDB models (8 models)
│   │   ├── services/       # Core business logic
│   │   │   ├── aiClient.ts           # LLM wrapper (Claude/OpenAI)
│   │   │   ├── promptBuilder.ts      # Dynamic context injection
│   │   │   ├── whatsappService.ts    # WhatsApp Cloud API
│   │   │   ├── productMatcher.ts     # Fuse.js product search
│   │   │   ├── faqMatcher.ts         # FAQ similarity matching
│   │   │   └── mediaService.ts       # Cloudinary uploads
│   │   ├── workers/
│   │   │   └── messageWorker.ts      # BullMQ message processor
│   │   ├── routes/         # API routes (8 routers)
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth, error handling
│   │   └── index.ts        # Express server
│   ├── scripts/
│   │   └── seed.ts         # Sample data generator
│   └── tests/              # Jest tests
├── frontend/               # React + Vite + Tailwind CSS
│   └── src/
│       ├── components/
│       │   ├── auth/       # Login
│       │   ├── admin/      # Admin dashboard (6 components)
│       │   ├── client/     # Client dashboard (6 components)
│       │   └── shared/     # Reusable components
│       ├── contexts/       # AuthContext
│       └── utils/          # API client, constants
├── docker-compose.yml      # MongoDB + Redis + Backend + Worker
├── .github/workflows/      # CI/CD pipeline
├── PROJECT_STRUCTURE.md    # Detailed folder tree
├── COMPLETE_CODE_FILES.md  # All backend code
├── FRONTEND_CODE.md        # Frontend configuration
├── REMAINING_FRONTEND_COMPONENTS.md  # All React components
├── QUICKSTART.md           # Step-by-step setup guide
└── README.md               # This file
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- MongoDB 7+
- Redis 7+
- Claude API key or OpenAI API key
- WhatsApp Business API credentials (optional for testing)

### Option 1: Docker (Recommended)

```bash
# 1. Navigate to project
cd smartbotly

# 2. Set up environment
cp backend/.env.example backend/.env
# Edit backend/.env and add your API keys

# 3. Start all services
docker-compose up -d

# 4. Seed sample data
docker-compose exec backend npm run seed

# 5. Access the app
# Backend: http://localhost:5000
# Frontend: http://localhost:5173
# MongoDB: localhost:27017
# Redis: localhost:6379
```

### Option 2: Manual Setup

```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Start Redis
redis-server

# Terminal 3: Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run seed
npm run dev

# Terminal 4: Worker
cd backend
npm run worker

# Terminal 5: Frontend
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Login Credentials (After Seeding)

**Admin:**
- Email: `admin@smartbotly.com`
- Password: `admin123`

**Client (Elegant Threads):**
- Email: `owner@elegantthreads.com`
- Password: `client123`

---

## 📖 Documentation

### Core Documentation Files

| File | Description |
|------|-------------|
| [QUICKSTART.md](./QUICKSTART.md) | Complete setup guide with troubleshooting |
| [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) | Detailed folder structure and file purposes |
| [COMPLETE_CODE_FILES.md](./COMPLETE_CODE_FILES.md) | All backend routes, controllers, seed script |
| [FRONTEND_CODE.md](./FRONTEND_CODE.md) | Frontend configuration and core components |
| [REMAINING_FRONTEND_COMPONENTS.md](./REMAINING_FRONTEND_COMPONENTS.md) | All React component code |

### Key Concepts

#### 1. LLM Provider Swapping

SmartBotly supports both Claude (Anthropic) and OpenAI with zero code changes:

```bash
# Switch to Claude
LLM_PROVIDER=claude
CLAUDE_API_KEY=sk-ant-xxxxx

# Switch to OpenAI
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-xxxxx
```

The `aiClient.ts` service automatically routes to the correct provider.

#### 2. Dynamic Context Injection

Every LLM call includes:
1. System instructions
2. Client business profile
3. Top-N products (configurable)
4. Top-M FAQs (by similarity)
5. Last K conversation messages

See `promptBuilder.ts` for implementation.

#### 3. Message Processing Flow

```
WhatsApp → Webhook (200 OK) → BullMQ Queue → Worker Process:
  1. Load conversation context
  2. Check exact FAQ match
  3. If no match → Build dynamic prompt
  4. Call LLM (Claude/OpenAI)
  5. Parse JSON response
  6. Execute action (SEND_TEXT, CREATE_ORDER, ESCALATE, etc.)
  7. Save to database
```

#### 4. Multi-Tenant Architecture

- **Admin users**: Manage all clients, prompts, view all data
- **Client users**: Manage own products, FAQs, view own conversations
- Authorization middleware ensures data isolation

---

## 🏗️ Architecture

### Technology Stack

**Backend:**
- Node.js 20 + TypeScript 5
- Express.js (REST API)
- MongoDB + Mongoose (Database)
- Redis + BullMQ (Job Queue)
- Claude / OpenAI (LLM)
- Cloudinary / S3 (Media Storage)
- Winston (Logging)

**Frontend:**
- React 18
- Vite 5 (Build Tool)
- Tailwind CSS 3
- React Router 6
- Axios (HTTP Client)
- React Hot Toast (Notifications)

**Infrastructure:**
- Docker + Docker Compose
- GitHub Actions (CI/CD)
- Nginx (Optional reverse proxy)

### Data Models

1. **User** - Admin and Client accounts
2. **Client** - Business profiles
3. **Product** - Product catalog
4. **FAQ** - Frequently asked questions
5. **Conversation** - WhatsApp chat sessions
6. **Message** - Individual messages
7. **Order** - Orders created by AI
8. **Prompt** - Custom AI prompts per client

---

## ⚙️ Features

### Admin Features

- ✅ Multi-client management
- ✅ Custom prompt editor per client
- ✅ Bulk product import (CSV)
- ✅ Chat simulator for testing
- ✅ System statistics dashboard
- ✅ Seed sample data with one click

### Client Features

- ✅ Real-time chat inbox
- ✅ Product catalog management
- ✅ FAQ editor with priority
- ✅ Business settings configuration
- ✅ Conversation history viewer

### Bot Capabilities

- ✅ Understand customer queries
- ✅ Recommend products
- ✅ Answer FAQs automatically
- ✅ Create orders from conversations
- ✅ Escalate complex issues to humans
- ✅ Send product images
- ✅ Reserve stock (placeholder)

---

## 🔄 Swap LLM Provider

### Switching to OpenAI

```bash
# 1. Edit backend/.env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
OPENAI_MODEL=gpt-4-turbo-preview

# 2. Restart backend
npm run dev
```

### Switching to Claude

```bash
# 1. Edit backend/.env
LLM_PROVIDER=claude
CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxx

# 2. Restart backend
npm run dev
```

### Adding a New Provider

1. Open `backend/src/services/aiClient.ts`
2. Add implementation in `callLLM()` function
3. Follow the pattern for `callClaude()` and `callOpenAI()`
4. Update `.env.example` with new credentials

---

## 🧪 Testing

### Run Tests

```bash
cd backend
npm test
```

### Manual Testing

1. **Login as Admin** → Create a new client
2. **Add products and FAQs** for the client
3. **Use Chat Simulator** → Test AI responses
4. **Login as Client** → View products, FAQs
5. **Configure WhatsApp webhook** → Test real messages

### API Testing

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smartbotly.com","password":"admin123"}'

# Get clients (use token from login)
curl http://localhost:5000/api/clients \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🐋 Docker Deployment

### Build and Run

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f worker

# Stop services
docker-compose down
```

### Environment Variables

All services use `backend/.env` file. See `backend/.env.example` for required variables.

---

## 📦 Production Deployment

### Recommended Platforms

**Backend:**
- [Render](https://render.com) - Easy setup, great for startups
- [Railway](https://railway.app) - Simple deployment with add-ons
- [AWS ECS](https://aws.amazon.com/ecs/) - Enterprise scale
- [DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform)

**Frontend:**
- [Vercel](https://vercel.com) - Optimal for React apps
- [Netlify](https://netlify.com) - Great CDN, easy setup
- [Cloudflare Pages](https://pages.cloudflare.com)

**Database:**
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Managed MongoDB
- [Redis Cloud](https://redis.com/redis-enterprise-cloud/) - Managed Redis

### Pre-deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Configure production MongoDB URI
- [ ] Configure production Redis host
- [ ] Add real WhatsApp credentials
- [ ] Enable webhook signature validation
- [ ] Set up Sentry or error tracking
- [ ] Configure CORS for production domain
- [ ] Enable HTTPS (required for WhatsApp)
- [ ] Set up automated backups
- [ ] Configure rate limiting
- [ ] Review security best practices

---

## 🛠️ Development

### Project Setup for Contributors

```bash
# Fork and clone
git clone https://github.com/yourusername/smartbotly.git
cd smartbotly

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start development servers
npm run dev  # in backend/
npm run dev  # in frontend/
```

### Code Style

- TypeScript for backend
- ESLint + Prettier (configured)
- Functional React components
- Async/await over promises
- Descriptive variable names

### Git Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Commit with descriptive message
4. Push and create pull request
5. Wait for review and CI to pass

---

## 🔮 Roadmap & Phase 2 Features

### Implemented (Phase 1)

- ✅ Multi-client SaaS architecture
- ✅ WhatsApp Cloud API integration
- ✅ LLM provider wrapper (Claude + OpenAI)
- ✅ Dynamic context injection
- ✅ Product fuzzy search (Fuse.js)
- ✅ FAQ exact matching
- ✅ Order creation from chat
- ✅ Admin and client portals
- ✅ Docker deployment
- ✅ Seed script with sample data

### Planned (Phase 2)

**🔍 Vector Search & Embeddings**
- Semantic product search using OpenAI embeddings
- Image-based product recognition (CLIP)
- Better FAQ matching with sentence transformers
- Hybrid search (keyword + semantic)

**🌍 Multi-language Support**
- Automatic language detection
- Response in customer's language
- Support Hindi, Tamil, Spanish, etc.

**💳 Payment Integration**
- Stripe payment links in chat
- Razorpay for India
- Payment status tracking
- Automatic order updates

**📊 Analytics Dashboard**
- Conversation metrics
- Popular products
- Customer satisfaction scores
- Response time analytics
- Revenue tracking

**🎙️ Voice Message Support**
- Transcribe audio messages
- Respond to voice queries

**📦 Advanced Inventory**
- Real-time stock tracking
- Low stock alerts
- Automatic product updates
- Supplier integration

**🔔 Notifications**
- Email notifications for escalations
- SMS alerts for orders
- Webhook for custom integrations

---

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
```bash
# Check if MongoDB is running
mongod --version
brew services start mongodb-community@7  # macOS
```

**Redis Connection Failed**
```bash
# Check if Redis is running
redis-cli ping
brew services start redis  # macOS
```

**Port Already in Use**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

**Worker Not Processing Messages**
```bash
# Check worker logs
npm run worker

# Check Redis keys
redis-cli
KEYS *
```

For detailed troubleshooting, see [QUICKSTART.md](./QUICKSTART.md#troubleshooting-checklist).

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 💬 Support

### Documentation
- [Quick Start Guide](./QUICKSTART.md)
- [API Documentation](#) _(coming soon)_
- [Video Tutorials](#) _(coming soon)_

### Community
- GitHub Issues: [Report a bug](https://github.com/yourusername/smartbotly/issues)
- Discord: Join our community _(link coming soon)_
- Email: support@smartbotly.com

### Commercial Support
For enterprise support, custom development, or consulting:
- Email: enterprise@smartbotly.com
- Website: [www.smartbotly.com](#) _(coming soon)_

---

## 🙏 Acknowledgments

- [Anthropic](https://www.anthropic.com/) for Claude API
- [OpenAI](https://openai.com/) for GPT models
- [Meta](https://developers.facebook.com/docs/whatsapp) for WhatsApp Business API
- [BullMQ](https://bullmq.io/) for robust job queues
- [Fuse.js](https://fusejs.io/) for fuzzy search
- Open source community for amazing tools

---

## 📊 Project Stats

- **Backend:** 3,000+ lines of TypeScript
- **Frontend:** 2,000+ lines of React/JSX
- **Models:** 8 MongoDB schemas
- **API Endpoints:** 30+ routes
- **Components:** 15+ React components
- **Tests:** 2 test suites (expandable)

---

<div align="center">

**Built with ❤️ using Claude Sonnet 4.5**

⭐ Star this repo if you find it useful!

[Report Bug](https://github.com/yourusername/smartbotly/issues) • [Request Feature](https://github.com/yourusername/smartbotly/issues)

</div>
# SmartBotly
