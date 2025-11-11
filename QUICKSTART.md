# SmartBotly - Quickstart Guide

## 🚀 Getting Started in 5 Minutes

This guide will help you get SmartBotly up and running locally.

---

## Prerequisites

- Node.js 20+ and npm
- MongoDB 7+ (or use Docker)
- Redis 7+ (or use Docker)
- Claude API key OR OpenAI API key
- WhatsApp Business API credentials (optional for testing)

---

## Local Development Setup

### Option 1: Using Docker (Recommended)

```bash
# 1. Clone or navigate to project
cd smartbotly

# 2. Set up environment variables
cp backend/.env.example backend/.env

# 3. Edit backend/.env and add your API keys:
#    - CLAUDE_API_KEY or OPENAI_API_KEY
#    - JWT_SECRET (any random string)
#    - Other credentials as needed

# 4. Start services with Docker
docker-compose up -d

# 5. Seed sample data
docker-compose exec backend npm run seed

# 6. Backend running at http://localhost:5000
# 7. MongoDB at localhost:27017
# 8. Redis at localhost:6379
```

### Option 2: Manual Setup

#### Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env

# 4. Edit .env file with your credentials
nano .env  # or use any editor

# Required variables:
#   MONGODB_URI=mongodb://localhost:27017/smartbotly
#   REDIS_HOST=localhost
#   JWT_SECRET=your-random-secret-key
#   CLAUDE_API_KEY=sk-ant-xxxxx  # OR OPENAI_API_KEY

# 5. Start MongoDB (separate terminal)
mongod

# 6. Start Redis (separate terminal)
redis-server

# 7. Seed sample data
npm run seed

# 8. Start backend server
npm run dev

# 9. Start BullMQ worker (separate terminal)
cd backend
npm run worker
```

#### Frontend Setup

```bash
# 1. Navigate to frontend (new terminal)
cd frontend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env

# 4. Edit .env (update API URL if needed)
echo "VITE_API_URL=http://localhost:5000/api" > .env

# 5. Start development server
npm run dev

# Frontend will be available at http://localhost:5173
```

---

## Login Credentials (After Seeding)

### Admin Account
- **Email:** admin@smartbotly.com
- **Password:** admin123
- **Access:** Full system access, client management, prompt editing

### Client Account (Elegant Threads)
- **Email:** owner@elegantthreads.com
- **Password:** client123
- **Access:** Product management, chat inbox, FAQs, settings

---

## Verify Installation

### 1. Check Backend Health

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

### 2. Check Database Connection

```bash
# Connect to MongoDB
mongo smartbotly

# Check collections
show collections

# Should see: clients, faqs, messages, products, users, etc.
```

### 3. Check Redis Connection

```bash
redis-cli
PING

# Should respond: PONG
```

### 4. Test Frontend

Open browser to http://localhost:5173

You should see the SmartBotly login page.

---

## Configure WhatsApp Webhook

### 1. Expose Local Server (for testing)

Use ngrok or similar tool to expose your local server:

```bash
# Install ngrok
npm install -g ngrok

# Expose port 5000
ngrok http 5000

# You'll get a URL like: https://abc123.ngrok.io
```

### 2. Configure Webhook in Meta Dashboard

1. Go to https://developers.facebook.com/apps/
2. Select your WhatsApp app
3. Go to WhatsApp > Configuration
4. Set Webhook URL: `https://abc123.ngrok.io/api/webhook/whatsapp`
5. Set Verify Token: (same as `WHATSAPP_WEBHOOK_VERIFY_TOKEN` in .env)
6. Subscribe to: `messages`, `message_status`
7. Click "Verify and Save"

### 3. Test Webhook

Send a WhatsApp message to your business number. Check logs:

```bash
# Backend logs
tail -f backend/logs/combined.log

# Worker logs (should show message processing)
docker-compose logs -f worker
```

---

## Testing the System

### Manual Testing

1. **Login as Admin**
   - Go to http://localhost:5173
   - Login with admin credentials
   - You should see the Admin Dashboard with Clients list

2. **View Sample Client**
   - Click on "Elegant Threads" client
   - Explore products, FAQs

3. **Test Chat Simulator**
   - Go to "Chat Simulator" in admin panel
   - Select "Elegant Threads" client
   - Send test messages like:
     - "Hi, I'm looking for a saree"
     - "What's your return policy?"
     - "Show me the blue silk saree"

4. **Login as Client**
   - Logout from admin account
   - Login with client credentials
   - View chat inbox (will be empty until real WhatsApp messages arrive)

### API Testing with cURL

```bash
# 1. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smartbotly.com","password":"admin123"}'

# Copy the token from response

# 2. Get all clients
curl http://localhost:5000/api/clients \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 3. Get products for a client
curl "http://localhost:5000/api/products?clientId=CLIENT_ID" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 4. Get FAQs
curl "http://localhost:5000/api/faqs?clientId=CLIENT_ID" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Run Tests

```bash
# Backend tests
cd backend
npm test

# Expected: 2 test suites pass (promptBuilder, productMatcher)
```

---

## Project Structure Overview

```
smartbotly/
├── backend/
│   ├── src/
│   │   ├── config/         # Database, Redis, constants
│   │   ├── models/         # Mongoose models
│   │   ├── services/       # LLM, WhatsApp, product matching
│   │   ├── workers/        # BullMQ message processor
│   │   ├── routes/         # Express routes
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth, error handling
│   │   └── index.ts        # Express server
│   ├── scripts/
│   │   └── seed.ts         # Database seeding
│   └── tests/              # Jest tests
├── frontend/
│   └── src/
│       ├── components/     # React components
│       ├── contexts/       # Auth context
│       └── utils/          # API client, constants
└── docker-compose.yml      # Docker orchestration
```

---

## Swap LLM Provider

SmartBotly supports both Claude (Anthropic) and OpenAI. To switch:

### Switch to OpenAI

```bash
# Edit backend/.env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
OPENAI_MODEL=gpt-4-turbo-preview

# Restart backend
npm run dev
```

### Switch to Claude

```bash
# Edit backend/.env
LLM_PROVIDER=claude
CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxx

# Restart backend
npm run dev
```

**Note:** The system automatically uses the configured provider. No code changes needed!

---

## Common Issues & Solutions

### Issue: MongoDB connection failed

**Solution:**
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB
brew services start mongodb-community@7  # macOS
sudo systemctl start mongod               # Linux
# or use Docker
docker run -d -p 27017:27017 mongo:7
```

### Issue: Redis connection failed

**Solution:**
```bash
# Check if Redis is running
redis-cli ping

# Start Redis
brew services start redis   # macOS
sudo systemctl start redis  # Linux
# or use Docker
docker run -d -p 6379:6379 redis:7-alpine
```

### Issue: Port 5000 already in use

**Solution:**
```bash
# Change port in backend/.env
PORT=5001

# Or kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### Issue: LLM API call fails

**Solution:**
1. Verify API key is correct in `.env`
2. Check API key has sufficient credits
3. For Claude: Ensure you're using correct model name
4. For OpenAI: Check rate limits

### Issue: Worker not processing messages

**Solution:**
```bash
# Check if worker is running
ps aux | grep worker

# Restart worker
npm run worker

# Check Redis connection
redis-cli
KEYS *
# Should see Bull queue keys
```

### Issue: Frontend can't connect to backend

**Solution:**
1. Verify backend is running: http://localhost:5000/health
2. Check CORS settings in `backend/src/index.ts`
3. Verify `VITE_API_URL` in `frontend/.env`

---

## Production Deployment

### Prepare for Production

1. **Environment Variables**

```bash
# backend/.env (production)
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/smartbotly
REDIS_HOST=redis-production.cloud.com
REDIS_PASSWORD=your-redis-password
JWT_SECRET=super-secret-production-key-change-this
CLAUDE_API_KEY=sk-ant-prod-key
WHATSAPP_ACCESS_TOKEN=production-token
CLOUDINARY_CLOUD_NAME=your-cloud
# ... other production keys
```

2. **Build Frontend**

```bash
cd frontend
npm run build

# Output in frontend/dist
# Deploy to Vercel, Netlify, or serve via Nginx
```

3. **Build Backend**

```bash
cd backend
npm run build

# Output in backend/dist
# Deploy to Render, Railway, AWS, or DigitalOcean
```

### Deploy with Docker

```bash
# Build images
docker-compose -f docker-compose.yml build

# Push to registry (Docker Hub, AWS ECR, etc.)
docker tag smartbotly-backend:latest yourusername/smartbotly:latest
docker push yourusername/smartbotly:latest

# Deploy on your server
docker-compose up -d
```

### Deployment Platforms

#### Render (Recommended for Backend)

1. Connect GitHub repository
2. Create Web Service for backend
3. Set environment variables
4. Deploy

#### Vercel (Recommended for Frontend)

1. Connect GitHub repository
2. Set root directory to `frontend`
3. Add `VITE_API_URL` environment variable
4. Deploy

#### Railway

1. New Project → Deploy from GitHub
2. Add MongoDB and Redis add-ons
3. Set environment variables
4. Deploy

---

## Monitoring & Logs

### View Logs

```bash
# Backend logs
tail -f backend/logs/combined.log
tail -f backend/logs/error.log

# Docker logs
docker-compose logs -f backend
docker-compose logs -f worker
```

### Add Sentry (Error Monitoring)

```bash
# Install Sentry SDK
cd backend
npm install @sentry/node

# Add to backend/src/index.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

---

## Next Steps & Phase 2 Features

### Immediate Next Steps
1. Configure WhatsApp template messages
2. Add your own client businesses
3. Customize prompts for each client
4. Test with real WhatsApp messages
5. Monitor conversations and orders

### Phase 2 Enhancements (TODOs in code)

#### 1. Vector Search for Products & FAQs
- Implement semantic search using embeddings
- Support image-based product search
- Better FAQ matching with sentence transformers

**Files to modify:**
- `backend/src/services/productMatcher.ts`
- `backend/src/services/faqMatcher.ts`

#### 2. Multi-language Support
- Detect customer language
- Respond in customer's language
- Support Hindi, Tamil, Telugu, etc.

#### 3. Payment Integration
- Stripe payment links in chat
- Razorpay for India
- Order payment tracking

#### 4. Analytics Dashboard
- Conversation metrics
- Popular products
- Response times
- Customer satisfaction scores

#### 5. Voice Message Support
- Transcribe audio messages
- Respond to voice queries

#### 6. Advanced Order Management
- Inventory tracking
- Automatic stock updates
- Shipping integration

---

## Client Onboarding Form

When onboarding new clients, collect this information:

### Business Information
- [ ] Business Name
- [ ] Industry/Category
- [ ] Business Description (2-3 sentences)
- [ ] Website URL
- [ ] Logo (optional)

### WhatsApp Configuration
- [ ] WhatsApp Business Phone Number
- [ ] WhatsApp Business Account ID
- [ ] Phone Number ID
- [ ] Access Token

### Business Hours
- [ ] Timezone
- [ ] Opening Time (e.g., 09:00)
- [ ] Closing Time (e.g., 18:00)
- [ ] Days of Operation

### Products
- [ ] Product catalog (CSV or manual entry)
- [ ] Product images
- [ ] Pricing and currency

### FAQs
- [ ] Common customer questions
- [ ] Policies (return, shipping, payment)
- [ ] Contact information

### Customization
- [ ] Preferred AI assistant tone (formal, friendly, casual)
- [ ] Custom greeting message
- [ ] Escalation phone number
- [ ] Special instructions

---

## Support & Resources

### Documentation
- Claude API: https://docs.anthropic.com/
- OpenAI API: https://platform.openai.com/docs
- WhatsApp Business API: https://developers.facebook.com/docs/whatsapp
- BullMQ: https://docs.bullmq.io/

### Community
- GitHub Issues: Report bugs or request features
- Discord: Join our community (link TBD)

### Commercial Support
Contact: support@smartbotly.com

---

## Security Best Practices

1. **Never commit .env files** - Use `.env.example` as template
2. **Rotate API keys regularly** - Especially in production
3. **Enable webhook signature validation** - Set `ENABLE_WEBHOOK_SIGNATURE_VALIDATION=true`
4. **Use HTTPS in production** - Required for WhatsApp webhooks
5. **Implement rate limiting** - Already configured, monitor usage
6. **Regular backups** - Backup MongoDB and Redis data
7. **Monitor logs** - Watch for suspicious activity
8. **Update dependencies** - Run `npm audit` regularly

---

## Performance Optimization

### Database Indexing
Already configured in models. Monitor slow queries:

```javascript
// Enable MongoDB slow query log
db.setProfilingLevel(1, { slowms: 100 });
```

### Redis Caching
Add caching for frequent queries:

```javascript
// Example: Cache product searches
const cacheKey = `products:${clientId}:${query}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const results = await searchProducts(clientId, query);
await redis.setex(cacheKey, 3600, JSON.stringify(results));
```

### BullMQ Concurrency
Adjust worker concurrency based on your server capacity:

```bash
# In backend/.env
QUEUE_CONCURRENCY=10  # Process 10 jobs simultaneously
```

---

## Troubleshooting Checklist

Before asking for help, check:

- [ ] All services are running (backend, worker, MongoDB, Redis)
- [ ] Environment variables are set correctly
- [ ] API keys are valid and have credits
- [ ] Firewall allows required ports (5000, 27017, 6379)
- [ ] Logs show no errors
- [ ] Database is seeded with sample data
- [ ] Frontend can reach backend API
- [ ] Node.js and npm versions are correct

---

## License

MIT License - see LICENSE file for details

---

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Submit pull request

---

**Happy Building! 🚀**

For questions or issues, open a GitHub issue or contact support.
