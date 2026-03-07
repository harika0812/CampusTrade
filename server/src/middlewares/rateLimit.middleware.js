import rateLimit from 'express-rate-limit';

const isNonProd = () => process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';

const parseIntEnv = (name, fallback) => {
  const parsed = Number.parseInt(process.env[name], 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

// General API rate limiter. Chat endpoints are handled by dedicated chat limiters.
export const generalLimiter = rateLimit({
  windowMs: parseIntEnv('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
  max: parseIntEnv('RATE_LIMIT_MAX', 600),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (isNonProd()) return true;
    if (req.path === '/') return true;
    if (req.path.startsWith('/api/chat')) return true;
    return false;
  }
});

// Strict rate limiter for auth endpoints - 5 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isNonProd,
  keyGenerator: (req) => req.body.email || req.ip
});

// Chat messages - 30 messages per minute per user
export const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: 'Too many messages, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: isNonProd,
  keyGenerator: (req) => req.user?.userId || req.body?.senderId || req.query?.userId || req.ip
});

// Chat reads and metadata - higher budget than message sends.
export const chatReadLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: parseIntEnv('CHAT_READ_RATE_LIMIT_MAX', 180),
  message: 'Too many chat refresh requests, please try again shortly.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: isNonProd,
  keyGenerator: (req) => req.user?.userId || req.ip
});

// Product creation - 10 products per hour per user
export const productLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many products listed, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: isNonProd,
  keyGenerator: (req) => req.user?.userId || req.ip
});

// Payment requests - 10 requests per minute per user
export const paymentLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: 'Too many payment requests, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: isNonProd,
  keyGenerator: (req) => req.user?.userId || req.ip
});
