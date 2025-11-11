# SmartBotly Project Structure

```
smartbotly/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts          # MongoDB connection
│   │   │   ├── redis.ts             # Redis connection
│   │   │   └── constants.ts         # App constants
│   │   ├── models/
│   │   │   ├── User.ts              # User model (Admin/Client)
│   │   │   ├── Client.ts            # Client business profile
│   │   │   ├── Product.ts           # Product catalog
│   │   │   ├── FAQ.ts               # FAQs per client
│   │   │   ├── Conversation.ts      # WhatsApp conversations
│   │   │   ├── Message.ts           # Individual messages
│   │   │   ├── Order.ts             # Orders created by bot
│   │   │   └── Prompt.ts            # Prompt templates
│   │   ├── middleware/
│   │   │   ├── auth.ts              # JWT auth middleware
│   │   │   └── errorHandler.ts     # Global error handler
│   │   ├── services/
│   │   │   ├── aiClient.ts          # LLM provider wrapper (Claude/OpenAI)
│   │   │   ├── promptBuilder.ts     # Dynamic prompt assembly
│   │   │   ├── whatsappService.ts   # WhatsApp Cloud API
│   │   │   ├── productMatcher.ts    # Fuse.js product search
│   │   │   ├── faqMatcher.ts        # FAQ similarity matching
│   │   │   └── mediaService.ts      # Cloudinary/S3 uploads
│   │   ├── workers/
│   │   │   └── messageWorker.ts     # BullMQ message processor
│   │   ├── routes/
│   │   │   ├── auth.routes.ts       # Login/register
│   │   │   ├── client.routes.ts     # Client CRUD
│   │   │   ├── product.routes.ts    # Product CRUD
│   │   │   ├── faq.routes.ts        # FAQ CRUD
│   │   │   ├── conversation.routes.ts # Chat history
│   │   │   ├── prompt.routes.ts     # Prompt management
│   │   │   ├── webhook.routes.ts    # WhatsApp webhook
│   │   │   └── admin.routes.ts      # Admin actions
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── clientController.ts
│   │   │   ├── productController.ts
│   │   │   ├── faqController.ts
│   │   │   ├── conversationController.ts
│   │   │   ├── promptController.ts
│   │   │   ├── webhookController.ts
│   │   │   └── adminController.ts
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript interfaces
│   │   ├── utils/
│   │   │   ├── logger.ts            # Winston logger
│   │   │   └── validators.ts        # Input validation
│   │   └── index.ts                 # Express app entry
│   ├── scripts/
│   │   └── seed.ts                  # Seed sample data
│   ├── tests/
│   │   ├── promptBuilder.test.ts
│   │   └── productMatcher.test.ts
│   ├── .env.example
│   ├── .gitignore
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── jest.config.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── Login.jsx
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── ClientList.jsx
│   │   │   │   ├── CreateClientModal.jsx
│   │   │   │   ├── PromptEditor.jsx
│   │   │   │   ├── ProductImport.jsx
│   │   │   │   └── ChatSimulator.jsx
│   │   │   ├── client/
│   │   │   │   ├── ClientDashboard.jsx
│   │   │   │   ├── ChatInbox.jsx
│   │   │   │   ├── ChatWindow.jsx
│   │   │   │   ├── ProductCatalog.jsx
│   │   │   │   ├── FAQEditor.jsx
│   │   │   │   └── Settings.jsx
│   │   │   ├── shared/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── LoadingSpinner.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useAPI.js
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── utils/
│   │   │   ├── api.js              # Axios instance
│   │   │   └── constants.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── .env.example
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── docker-compose.yml
├── .github/
│   └── workflows/
│       └── deploy.yml
├── README.md
└── QUICKSTART.md
```

## Key File Purposes

### Backend Core
- **index.ts**: Express server setup, middleware, routes
- **messageWorker.ts**: BullMQ worker that processes WhatsApp messages
- **aiClient.ts**: Abstraction layer for Claude/OpenAI with easy swapping
- **promptBuilder.ts**: Assembles dynamic prompts with context injection
- **whatsappService.ts**: Send/receive WhatsApp messages via Cloud API

### Frontend Core
- **App.jsx**: Main routing (Admin vs Client dashboards)
- **AdminDashboard.jsx**: Super admin interface
- **ClientDashboard.jsx**: Business owner interface
- **ChatWindow.jsx**: Real-time chat view with message history

### Infrastructure
- **docker-compose.yml**: Orchestrates backend, MongoDB, Redis
- **seed.ts**: Creates sample client "Elegant Threads" + Admin user
