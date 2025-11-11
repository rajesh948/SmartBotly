# SmartBotly - Complete Code Files (Continuation)

This document contains all remaining code files needed to complete the SmartBotly project. Copy each file to its respective location as indicated.

---

## Backend Routes & Controllers

### backend/src/routes/auth.routes.ts

```typescript
import { Router } from 'express';
import { body } from 'express-validator';
import { login, register, getCurrentUser } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { loginValidator, registerValidator } from '../utils/validators';

const router = Router();

router.post('/login', loginValidator(), login);
router.post('/register', registerValidator(), register);
router.get('/me', authenticate, getCurrentUser);

export default router;
```

### backend/src/routes/client.routes.ts

```typescript
import { Router } from 'express';
import {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} from '../controllers/clientController';
import { authenticate, authorize, authorizeClientAccess } from '../middleware/auth';
import { UserRole } from '../types';
import { createClientValidator, mongoIdValidator } from '../utils/validators';

const router = Router();

// Admin only
router.get('/', authenticate, authorize(UserRole.ADMIN), getAllClients);
router.post('/', authenticate, authorize(UserRole.ADMIN), createClientValidator(), createClient);

// Admin or own client
router.get('/:id', authenticate, mongoIdValidator('id'), authorizeClientAccess, getClientById);
router.put('/:id', authenticate, mongoIdValidator('id'), authorizeClientAccess, updateClient);
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), mongoIdValidator('id'), deleteClient);

export default router;
```

### backend/src/routes/product.routes.ts

```typescript
import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  importProductsCSV,
} from '../controllers/productController';
import { authenticate, authorizeClientAccess } from '../middleware/auth';
import { createProductValidator, mongoIdValidator } from '../utils/validators';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', authenticate, authorizeClientAccess, getAllProducts);
router.get('/search', authenticate, authorizeClientAccess, searchProducts);
router.get('/:id', authenticate, mongoIdValidator('id'), getProductById);
router.post('/', authenticate, authorizeClientAccess, createProductValidator(), createProduct);
router.put('/:id', authenticate, mongoIdValidator('id'), updateProduct);
router.delete('/:id', authenticate, mongoIdValidator('id'), deleteProduct);
router.post('/import', authenticate, authorizeClientAccess, upload.single('file'), importProductsCSV);

export default router;
```

### backend/src/routes/faq.routes.ts

```typescript
import { Router } from 'express';
import {
  getAllFAQs,
  getFAQById,
  createFAQ,
  updateFAQ,
  deleteFAQ,
} from '../controllers/faqController';
import { authenticate, authorizeClientAccess } from '../middleware/auth';
import { createFAQValidator, mongoIdValidator } from '../utils/validators';

const router = Router();

router.get('/', authenticate, authorizeClientAccess, getAllFAQs);
router.get('/:id', authenticate, mongoIdValidator('id'), getFAQById);
router.post('/', authenticate, authorizeClientAccess, createFAQValidator(), createFAQ);
router.put('/:id', authenticate, mongoIdValidator('id'), updateFAQ);
router.delete('/:id', authenticate, mongoIdValidator('id'), deleteFAQ);

export default router;
```

### backend/src/routes/conversation.routes.ts

```typescript
import { Router } from 'express';
import {
  getAllConversations,
  getConversationById,
  getConversationMessages,
} from '../controllers/conversationController';
import { authenticate, authorizeClientAccess } from '../middleware/auth';
import { mongoIdValidator } from '../utils/validators';

const router = Router();

router.get('/', authenticate, authorizeClientAccess, getAllConversations);
router.get('/:id', authenticate, mongoIdValidator('id'), getConversationById);
router.get('/:id/messages', authenticate, mongoIdValidator('id'), getConversationMessages);

export default router;
```

### backend/src/routes/prompt.routes.ts

```typescript
import { Router } from 'express';
import {
  getAllPrompts,
  getPromptById,
  createPrompt,
  updatePrompt,
  deletePrompt,
} from '../controllers/promptController';
import { authenticate, authorize, authorizeClientAccess } from '../middleware/auth';
import { UserRole } from '../types';
import { createPromptValidator, mongoIdValidator } from '../utils/validators';

const router = Router();

router.get('/', authenticate, authorizeClientAccess, getAllPrompts);
router.get('/:id', authenticate, mongoIdValidator('id'), getPromptById);
router.post('/', authenticate, authorize(UserRole.ADMIN), createPromptValidator(), createPrompt);
router.put('/:id', authenticate, authorize(UserRole.ADMIN), mongoIdValidator('id'), updatePrompt);
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), mongoIdValidator('id'), deletePrompt);

export default router;
```

### backend/src/routes/admin.routes.ts

```typescript
import { Router } from 'express';
import { seedSampleData, getStats } from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

router.post('/seed', authenticate, authorize(UserRole.ADMIN), seedSampleData);
router.get('/stats', authenticate, authorize(UserRole.ADMIN), getStats);

export default router;
```

---

## Backend Controllers

### backend/src/controllers/authController.ts

```typescript
import { Response } from 'express';
import { validationResult } from 'express-validator';
import { User } from '../models/User';
import { AuthRequest, UserRole } from '../types';
import { generateToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email, isActive: true });
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = generateToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    clientId: user.clientId,
  });

  logger.info('User logged in', { userId: user._id, email: user.email });

  res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      clientId: user.clientId,
    },
  });
});

export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { email, password, name, role, clientId } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400).json({ error: 'Email already registered' });
    return;
  }

  const user = await User.create({
    email,
    password,
    name,
    role,
    clientId: role === UserRole.CLIENT ? clientId : undefined,
  });

  const token = generateToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    clientId: user.clientId,
  });

  logger.info('User registered', { userId: user._id, email: user.email });

  res.status(201).json({
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      clientId: user.clientId,
    },
  });
});

export const getCurrentUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user?.id).select('-password');

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({ user });
});
```

### backend/src/controllers/clientController.ts

```typescript
import { Response } from 'express';
import { validationResult } from 'express-validator';
import { Client } from '../models/Client';
import { User } from '../models/User';
import { AuthRequest, UserRole } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export const getAllClients = asyncHandler(async (req: AuthRequest, res: Response) => {
  const clients = await Client.find().sort({ createdAt: -1 });
  res.json({ clients });
});

export const getClientById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const client = await Client.findById(req.params.id);

  if (!client) {
    res.status(404).json({ error: 'Client not found' });
    return;
  }

  res.json({ client });
});

export const createClient = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const client = await Client.create(req.body);

  logger.info('Client created', { clientId: client._id });

  res.status(201).json({ client });
});

export const updateClient = asyncHandler(async (req: AuthRequest, res: Response) => {
  const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!client) {
    res.status(404).json({ error: 'Client not found' });
    return;
  }

  logger.info('Client updated', { clientId: client._id });

  res.json({ client });
});

export const deleteClient = asyncHandler(async (req: AuthRequest, res: Response) => {
  const client = await Client.findByIdAndDelete(req.params.id);

  if (!client) {
    res.status(404).json({ error: 'Client not found' });
    return;
  }

  logger.info('Client deleted', { clientId: client._id });

  res.json({ message: 'Client deleted successfully' });
});
```

### backend/src/controllers/productController.ts

```typescript
import { Response } from 'express';
import { validationResult } from 'express-validator';
import { Product } from '../models/Product';
import { AuthRequest } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import { searchProducts as searchProductsService } from '../services/productMatcher';
import csvParser from 'csv-parser';
import { Readable } from 'stream';

export const getAllProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.role === 'ADMIN' ? req.query.clientId : req.user?.clientId;

  const products = await Product.find({ clientId }).sort({ createdAt: -1 });
  res.json({ products });
});

export const getProductById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  res.json({ product });
});

export const createProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const product = await Product.create(req.body);
  res.status(201).json({ product });
});

export const updateProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  res.json({ product });
});

export const deleteProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  res.json({ message: 'Product deleted successfully' });
});

export const searchProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { query, clientId } = req.query;

  if (!query || !clientId) {
    res.status(400).json({ error: 'Query and clientId are required' });
    return;
  }

  const products = await searchProductsService(clientId as string, query as string);
  res.json({ products });
});

export const importProductsCSV = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'CSV file is required' });
    return;
  }

  const clientId = req.body.clientId || req.user?.clientId;
  const products: any[] = [];

  const stream = Readable.from(req.file.buffer);

  stream
    .pipe(csvParser())
    .on('data', (row) => {
      products.push({
        clientId,
        name: row.name,
        description: row.description,
        price: parseFloat(row.price),
        currency: row.currency || 'USD',
        category: row.category,
        sku: row.sku,
        stock: parseInt(row.stock) || 0,
        tags: row.tags ? row.tags.split(',').map((t: string) => t.trim()) : [],
      });
    })
    .on('end', async () => {
      await Product.insertMany(products);
      res.json({ message: `${products.length} products imported successfully` });
    });
});
```

### backend/src/controllers/faqController.ts

```typescript
import { Response } from 'express';
import { validationResult } from 'express-validator';
import { FAQ } from '../models/FAQ';
import { AuthRequest } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

export const getAllFAQs = asyncHandler(async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.role === 'ADMIN' ? req.query.clientId : req.user?.clientId;

  const faqs = await FAQ.find({ clientId }).sort({ priority: -1, createdAt: -1 });
  res.json({ faqs });
});

export const getFAQById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const faq = await FAQ.findById(req.params.id);

  if (!faq) {
    res.status(404).json({ error: 'FAQ not found' });
    return;
  }

  res.json({ faq });
});

export const createFAQ = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const faq = await FAQ.create(req.body);
  res.status(201).json({ faq });
});

export const updateFAQ = asyncHandler(async (req: AuthRequest, res: Response) => {
  const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!faq) {
    res.status(404).json({ error: 'FAQ not found' });
    return;
  }

  res.json({ faq });
});

export const deleteFAQ = asyncHandler(async (req: AuthRequest, res: Response) => {
  const faq = await FAQ.findByIdAndDelete(req.params.id);

  if (!faq) {
    res.status(404).json({ error: 'FAQ not found' });
    return;
  }

  res.json({ message: 'FAQ deleted successfully' });
});
```

### backend/src/controllers/conversationController.ts

```typescript
import { Response } from 'express';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { AuthRequest } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

export const getAllConversations = asyncHandler(async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.role === 'ADMIN' ? req.query.clientId : req.user?.clientId;

  const conversations = await Conversation.find({ clientId }).sort({ lastMessageAt: -1 });
  res.json({ conversations });
});

export const getConversationById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const conversation = await Conversation.findById(req.params.id);

  if (!conversation) {
    res.status(404).json({ error: 'Conversation not found' });
    return;
  }

  res.json({ conversation });
});

export const getConversationMessages = asyncHandler(async (req: AuthRequest, res: Response) => {
  const messages = await Message.find({ conversationId: req.params.id }).sort({ timestamp: 1 });

  res.json({ messages });
});
```

### backend/src/controllers/promptController.ts

```typescript
import { Response } from 'express';
import { validationResult } from 'express-validator';
import { Prompt } from '../models/Prompt';
import { AuthRequest } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

export const getAllPrompts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.role === 'ADMIN' ? req.query.clientId : req.user?.clientId;

  const prompts = await Prompt.find({ clientId }).sort({ createdAt: -1 });
  res.json({ prompts });
});

export const getPromptById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const prompt = await Prompt.findById(req.params.id);

  if (!prompt) {
    res.status(404).json({ error: 'Prompt not found' });
    return;
  }

  res.json({ prompt });
});

export const createPrompt = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const prompt = await Prompt.create(req.body);
  res.status(201).json({ prompt });
});

export const updatePrompt = asyncHandler(async (req: AuthRequest, res: Response) => {
  const prompt = await Prompt.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!prompt) {
    res.status(404).json({ error: 'Prompt not found' });
    return;
  }

  res.json({ prompt });
});

export const deletePrompt = asyncHandler(async (req: AuthRequest, res: Response) => {
  const prompt = await Prompt.findByIdAndDelete(req.params.id);

  if (!prompt) {
    res.status(404).json({ error: 'Prompt not found' });
    return;
  }

  res.json({ message: 'Prompt deleted successfully' });
});
```

### backend/src/controllers/adminController.ts

```typescript
import { Response } from 'express';
import { AuthRequest } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import { seedDatabase } from '../../scripts/seed';
import { Client } from '../models/Client';
import { Product } from '../models/Product';
import { FAQ } from '../models/FAQ';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { Order } from '../models/Order';

export const seedSampleData = asyncHandler(async (req: AuthRequest, res: Response) => {
  await seedDatabase();
  res.json({ message: 'Sample data seeded successfully' });
});

export const getStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const stats = {
    clients: await Client.countDocuments(),
    products: await Product.countDocuments(),
    faqs: await FAQ.countDocuments(),
    conversations: await Conversation.countDocuments(),
    messages: await Message.countDocuments(),
    orders: await Order.countDocuments(),
  };

  res.json({ stats });
});
```

---

## Seed Script

### backend/scripts/seed.ts

```typescript
import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase } from '../src/config/database';
import { User } from '../src/models/User';
import { Client } from '../src/models/Client';
import { Product } from '../src/models/Product';
import { FAQ } from '../src/models/FAQ';
import { Prompt } from '../src/models/Prompt';
import { logger } from '../src/utils/logger';
import { UserRole } from '../src/types';

dotenv.config();

export const seedDatabase = async () => {
  try {
    logger.info('Starting database seed...');

    // Clear existing data
    await User.deleteMany({});
    await Client.deleteMany({});
    await Product.deleteMany({});
    await FAQ.deleteMany({});
    await Prompt.deleteMany({});

    // Create Admin User
    const adminUser = await User.create({
      email: 'admin@smartbotly.com',
      password: 'admin123',
      name: 'Admin User',
      role: UserRole.ADMIN,
      isActive: true,
    });

    logger.info('✅ Admin user created', { email: adminUser.email });

    // Create Sample Client: Elegant Threads
    const elegantThreads = await Client.create({
      businessName: 'Elegant Threads',
      industry: 'Fashion & Apparel',
      whatsappPhoneNumber: '+919876543210',
      description:
        'Premium fashion boutique offering handcrafted ethnic wear and contemporary fusion styles. Specializing in silk sarees, designer kurtas, and custom-tailored garments.',
      website: 'https://elegantthreads.com',
      settings: {
        enableAutoResponses: true,
        businessHours: {
          start: '09:00',
          end: '18:00',
          timezone: 'Asia/Kolkata',
        },
        fallbackMessage:
          'Thank you for contacting Elegant Threads! Our team will get back to you during business hours (9 AM - 6 PM IST).',
        escalationPhoneNumber: '+919876543211',
      },
      isActive: true,
    });

    logger.info('✅ Client created', { businessName: elegantThreads.businessName });

    // Create Client User
    const clientUser = await User.create({
      email: 'owner@elegantthreads.com',
      password: 'client123',
      name: 'Priya Sharma',
      role: UserRole.CLIENT,
      clientId: elegantThreads._id.toString(),
      isActive: true,
    });

    logger.info('✅ Client user created', { email: clientUser.email });

    // Create Products
    const products = [
      {
        clientId: elegantThreads._id,
        name: 'Royal Blue Silk Saree',
        description:
          'Handwoven pure silk saree with intricate gold zari work. Perfect for weddings and special occasions. 6.5 meters with unstitched blouse piece.',
        category: 'Sarees',
        price: 8500,
        currency: 'INR',
        stock: 5,
        sku: 'SS001',
        imageUrls: ['https://example.com/saree1.jpg'],
        tags: ['silk', 'wedding', 'traditional', 'zari'],
        isAvailable: true,
      },
      {
        clientId: elegantThreads._id,
        name: 'Pastel Pink Cotton Kurta Set',
        description:
          'Comfortable cotton kurta with matching palazzo pants and dupatta. Perfect for casual and festive wear. Available in all sizes.',
        category: 'Kurta Sets',
        price: 2499,
        currency: 'INR',
        stock: 12,
        sku: 'CK002',
        imageUrls: ['https://example.com/kurta1.jpg'],
        tags: ['cotton', 'kurta', 'palazzo', 'casual'],
        isAvailable: true,
      },
      {
        clientId: elegantThreads._id,
        name: 'Emerald Green Lehenga',
        description:
          'Designer lehenga with heavy embroidery and mirror work. Includes blouse and dupatta. Custom sizing available.',
        category: 'Lehengas',
        price: 15999,
        currency: 'INR',
        stock: 3,
        sku: 'LH003',
        imageUrls: ['https://example.com/lehenga1.jpg'],
        tags: ['lehenga', 'designer', 'wedding', 'embroidery'],
        isAvailable: true,
      },
      {
        clientId: elegantThreads._id,
        name: 'Black Georgette Gown',
        description:
          'Elegant floor-length gown with sequin work. Perfect for evening events and parties. Imported fabric.',
        category: 'Gowns',
        price: 5999,
        currency: 'INR',
        stock: 8,
        sku: 'GW004',
        imageUrls: ['https://example.com/gown1.jpg'],
        tags: ['gown', 'party wear', 'georgette', 'western'],
        isAvailable: true,
      },
      {
        clientId: elegantThreads._id,
        name: 'Cream Tussar Silk Dupatta',
        description:
          'Lightweight tussar silk dupatta with block print. Versatile accessory for any outfit. 2.5 meters.',
        category: 'Accessories',
        price: 899,
        currency: 'INR',
        stock: 20,
        sku: 'AC005',
        imageUrls: ['https://example.com/dupatta1.jpg'],
        tags: ['dupatta', 'silk', 'accessory', 'block print'],
        isAvailable: true,
      },
    ];

    await Product.insertMany(products);

    logger.info('✅ Products created', { count: products.length });

    // Create FAQs
    const faqs = [
      {
        clientId: elegantThreads._id,
        question: 'What is your return policy?',
        answer:
          'We accept returns within 7 days of delivery if the item is unused, unwashed, and has all original tags attached. Custom-tailored items cannot be returned.',
        category: 'Returns',
        tags: ['return', 'policy', 'exchange'],
        priority: 10,
        isActive: true,
      },
      {
        clientId: elegantThreads._id,
        question: 'Do you offer custom sizing?',
        answer:
          'Yes! We offer custom sizing for all our products. Please share your measurements after placing the order. Custom sizing takes an additional 7-10 days and costs INR 500 extra.',
        category: 'Customization',
        tags: ['sizing', 'custom', 'tailoring'],
        priority: 9,
        isActive: true,
      },
      {
        clientId: elegantThreads._id,
        question: 'How long does delivery take?',
        answer:
          'Standard delivery takes 5-7 business days. Express delivery (2-3 days) is available for INR 200 extra. We ship across India via trusted courier partners.',
        category: 'Shipping',
        tags: ['delivery', 'shipping', 'courier'],
        priority: 8,
        isActive: true,
      },
      {
        clientId: elegantThreads._id,
        question: 'What payment methods do you accept?',
        answer:
          'We accept UPI, credit/debit cards, net banking, and cash on delivery (COD). For orders above INR 10,000, 50% advance payment is required.',
        category: 'Payment',
        tags: ['payment', 'cod', 'upi'],
        priority: 7,
        isActive: true,
      },
      {
        clientId: elegantThreads._id,
        question: 'Can I visit your store?',
        answer:
          'Yes! Our boutique is open Monday to Saturday, 10 AM - 7 PM. We are located at 123 MG Road, Bangalore. Please call ahead for appointments.',
        category: 'Store',
        tags: ['store', 'visit', 'location'],
        priority: 6,
        isActive: true,
      },
    ];

    await FAQ.insertMany(faqs);

    logger.info('✅ FAQs created', { count: faqs.length });

    // Create Custom Prompt
    const prompt = await Prompt.create({
      clientId: elegantThreads._id,
      name: 'Elegant Threads AI Assistant',
      type: 'system',
      content: `You are Meera, the AI shopping assistant for {{businessName}}, a premium {{industry}} boutique.

Your personality:
- Warm, friendly, and culturally aware
- Knowledgeable about Indian fashion and traditions
- Helpful with sizing, styling suggestions, and fabric care
- Proactive in suggesting matching accessories

Key responsibilities:
1. Help customers find the perfect outfit for their occasion
2. Provide accurate product information and availability
3. Guide customers through the ordering process
4. Answer questions about customization, sizing, and delivery
5. Escalate complex queries to human staff

IMPORTANT:
- Always respond in JSON format as specified
- Be respectful of customer budget constraints
- Suggest alternatives if requested items are out of stock
- Use Hindi/Hinglish terms naturally (like "dupatta", "kurta") when appropriate`,
      variables: ['businessName', 'industry'],
      isActive: true,
    });

    logger.info('✅ Custom prompt created');

    logger.info(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║            🌱 DATABASE SEEDED SUCCESSFULLY                 ║
║                                                           ║
║  Admin User:                                              ║
║    Email: admin@smartbotly.com                            ║
║    Password: admin123                                     ║
║                                                           ║
║  Client User (Elegant Threads):                           ║
║    Email: owner@elegantthreads.com                        ║
║    Password: client123                                    ║
║                                                           ║
║  Sample Data:                                             ║
║    - 1 Client (Elegant Threads)                           ║
║    - 5 Products                                           ║
║    - 5 FAQs                                               ║
║    - 1 Custom Prompt                                      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);

    return {
      adminUser,
      clientUser,
      client: elegantThreads,
      productsCount: products.length,
      faqsCount: faqs.length,
    };
  } catch (error) {
    logger.error('Error seeding database:', error);
    throw error;
  }
};

// Run seed if this file is executed directly
if (require.main === module) {
  connectDatabase()
    .then(() => seedDatabase())
    .then(() => {
      logger.info('Seed completed successfully');
      return disconnectDatabase();
    })
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seed failed:', error);
      process.exit(1);
    });
}
```

---

## Tests

### backend/tests/promptBuilder.test.ts

```typescript
import { buildSimplePrompt } from '../src/services/promptBuilder';
import { connectDatabase, disconnectDatabase } from '../src/config/database';
import { Client } from '../src/models/Client';
import { Product } from '../src/models/Product';
import { FAQ } from '../src/models/FAQ';

describe('Prompt Builder Service', () => {
  beforeAll(async () => {
    await connectDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  it('should build a complete prompt with context', async () => {
    // Create test client
    const client = await Client.create({
      businessName: 'Test Business',
      industry: 'Retail',
      whatsappPhoneNumber: '+1234567890',
    });

    // Create test product
    await Product.create({
      clientId: client._id,
      name: 'Test Product',
      description: 'A test product',
      price: 100,
      currency: 'USD',
      isAvailable: true,
    });

    // Create test FAQ
    await FAQ.create({
      clientId: client._id,
      question: 'Test question?',
      answer: 'Test answer',
      isActive: true,
    });

    // Build prompt
    const result = await buildSimplePrompt(client._id.toString(), 'What products do you have?');

    expect(result.systemPrompt).toContain('Test Business');
    expect(result.systemPrompt).toContain('Test Product');
    expect(result.systemPrompt).toContain('Test question');
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].content).toBe('What products do you have?');

    // Cleanup
    await Client.findByIdAndDelete(client._id);
  });
});
```

### backend/tests/productMatcher.test.ts

```typescript
import { searchProducts } from '../src/services/productMatcher';
import { connectDatabase, disconnectDatabase } from '../src/config/database';
import { Client } from '../src/models/Client';
import { Product } from '../src/models/Product';

describe('Product Matcher Service', () => {
  let clientId: string;

  beforeAll(async () => {
    await connectDatabase();

    const client = await Client.create({
      businessName: 'Test Store',
      industry: 'Fashion',
      whatsappPhoneNumber: '+1234567890',
    });

    clientId = client._id.toString();

    await Product.create({
      clientId,
      name: 'Blue Cotton Shirt',
      description: 'Comfortable cotton shirt in blue color',
      price: 50,
      currency: 'USD',
      tags: ['cotton', 'casual', 'blue'],
      isAvailable: true,
    });

    await Product.create({
      clientId,
      name: 'Red Silk Dress',
      description: 'Elegant silk dress in red',
      price: 150,
      currency: 'USD',
      tags: ['silk', 'formal', 'red'],
      isAvailable: true,
    });
  });

  afterAll(async () => {
    await Client.findByIdAndDelete(clientId);
    await Product.deleteMany({ clientId });
    await disconnectDatabase();
  });

  it('should find products matching query', async () => {
    const results = await searchProducts(clientId, 'blue shirt');

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toContain('Blue');
  });

  it('should return empty array if no matches', async () => {
    const results = await searchProducts(clientId, 'xyz123nonexistent');

    expect(results).toEqual([]);
  });
});
```

---

## Docker & Deployment

### backend/Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 5000

# Start server
CMD ["npm", "start"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    container_name: smartbotly-mongo
    restart: always
    ports:
      - '27017:27017'
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
      MONGO_INITDB_DATABASE: smartbotly
    volumes:
      - mongo-data:/data/db

  redis:
    image: redis:7-alpine
    container_name: smartbotly-redis
    restart: always
    ports:
      - '6379:6379'
    volumes:
      - redis-data:/data

  backend:
    build: ./backend
    container_name: smartbotly-backend
    restart: always
    ports:
      - '5000:5000'
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://admin:password123@mongodb:27017/smartbotly?authSource=admin
      REDIS_HOST: redis
      REDIS_PORT: 6379
    env_file:
      - ./backend/.env
    depends_on:
      - mongodb
      - redis
    volumes:
      - ./backend/logs:/app/logs

  worker:
    build: ./backend
    container_name: smartbotly-worker
    restart: always
    command: npm run worker
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://admin:password123@mongodb:27017/smartbotly?authSource=admin
      REDIS_HOST: redis
      REDIS_PORT: 6379
    env_file:
      - ./backend/.env
    depends_on:
      - mongodb
      - redis
    volumes:
      - ./backend/logs:/app/logs

volumes:
  mongo-data:
  redis-data:
```

### .github/workflows/deploy.yml

```yaml
name: Deploy SmartBotly

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          cd backend
          npm ci

      - name: Run tests
        run: |
          cd backend
          npm test

      - name: Build TypeScript
        run: |
          cd backend
          npm run build

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Login to DockerHub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and push Docker image
        run: |
          cd backend
          docker build -t ${{ secrets.DOCKERHUB_USERNAME }}/smartbotly-backend:latest .
          docker push ${{ secrets.DOCKERHUB_USERNAME }}/smartbotly-backend:latest

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest

    steps:
      - name: Deploy to production
        run: |
          echo "Deploy to your hosting provider (Render, Railway, AWS, etc.)"
          # Add deployment commands here
```

---

## Continue in next message for FRONTEND CODE...

The frontend code is comprehensive and will be in a separate file.
