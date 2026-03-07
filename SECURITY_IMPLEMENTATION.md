# 🔒 Security Hardening - Implementation Guide

## What Was Implemented

### 1. **CORS Configuration** ✅
- **Before**: `cors()` - allowed all origins (insecure)
- **After**: Restricted to `CLIENT_URL` environment variable only
- **Location**: `server/src/app.js`

```javascript
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 3600
};
```

### 2. **Rate Limiting** ✅
- **General API**: 100 requests per 15 minutes per IP
- **Auth Endpoints**: 5 requests per 15 minutes per email (brute force protection)
- **Chat Messages**: 30 messages per minute per user
- **Product Listings**: 10 products per hour per user
- **Location**: `server/src/middlewares/rateLimit.middleware.js`

### 3. **Input Validation & Sanitization** ✅
- **Auth**: Email format, password strength, name format
- **Products**: Title, description, price ranges, category whitelist
- **Chat**: Message length, user ID validation
- **Prevents**: XSS, NoSQL injection, invalid data
- **Location**: `server/src/middlewares/validate.js`

### 4. **Security Headers & Middleware** ✅
- **Payload Size Limits**: 10MB max for JSON (prevents DoS)
- **Input Sanitization**: All strings sanitized to remove XSS vectors
- **NoSQL Injection Prevention**: `express-mongo-sanitize`
- **XSS Protection**: `xss-clean` + `isomorphic-dompurify`

### 5. **Environment Variables** ✅
- **Created**: `.env.example` with all required variables
- **Created**: `.gitignore` to prevent `.env` from being committed
- **Guidelines**: Use strong random strings for `JWT_SECRET`, app-specific passwords for email

---

## 🔧 Setup Instructions

### 1. Install New Dependencies
```bash
cd server
npm install
```

This installs:
- `express-rate-limit` - Rate limiting
- `express-validator` - Input validation
- `express-mongo-sanitize` - NoSQL injection prevention
- `xss-clean` - XSS attack prevention
- `isomorphic-dompurify` - HTML sanitization

### 2. Update Environment Variables
```bash
cd server
cp .env.example .env
```

Then edit `.env` with your credentials:
- Open `server/.env`
- Replace placeholders with real values
- **NEVER commit `.env` to git**

### 3. Restart Server
```bash
npm run dev
```

---

## 🚨 Important Security Notes

### What's Protected Now
✅ Passwords: 8+ chars, uppercase, lowercase, numbers
✅ Emails: GNITS domain only, format validated
✅ Messages: 1-10000 characters, rate limited
✅ Products: Valid category, price range 0-999999
✅ All inputs: Trimmed, sanitized, HTML-escaped

### Brute Force Protection
- Login attempts: Max 5 per 15 minutes per email
- Auto-blocks repeated failed attempts
- Email-based, not IP-based (shared networks)

### DoS Protection
- 100 requests per 15 min per IP for general API
- 10 products per hour per user
- 30 messages per minute per user
- Payload size capped at 10MB

### CORS Protection
- Only your frontend can make API calls
- Change `CLIENT_URL` in `.env` for production
- For multiple domains: Update CORS config in `app.js`

---

## 📋 Validation Rules

### Registration
- Email: Must end with `@gnits.ac.in` and be valid email
- Password: Min 6 chars, must contain uppercase + lowercase + number
- Name: 2-100 chars, letters and spaces only

### Login
- Email: Must be valid email format
- Password: Any value (brute force protection via rate limiting)

### Product Listing
- Title: 3-200 characters
- Description: 10-5000 characters
- Price: 0-999999 (any currency)
- Category: Only Books, Electronics, Lab Equipment, Notes, Others

### Chat Messages
- Message: 1-10000 characters, rate limited to 30/min/user

---

## 🔍 Testing the Security

### Test Rate Limiting
```bash
# Make 6 login attempts - 6th should fail
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gnits.ac.in","password":"test"}'
```

### Test CORS
```bash
# From different domain - should fail
curl -X GET http://localhost:5000/api/products \
  -H "Origin: http://other-site.com"
```

### Test Input Validation
```bash
# Invalid email - should fail
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"User","email":"invalid","password":"Test123"}'
```

---

## 🚀 Production Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to a strong random string (32+ chars)
- [ ] Use app-specific password for email (not Gmail login password)
- [ ] Update `CLIENT_URL` to your production frontend URL
- [ ] Set `NODE_ENV=production`
- [ ] Use environment variables from your hosting platform (Vercel, Railway, etc.)
- [ ] Enable HTTPS (production URLs should be https://)
- [ ] Consider adding more rate limits for production
- [ ] Monitor logs for suspicious activity
- [ ] Regularly update npm packages: `npm audit fix`

---

## 🔗 Related Files Modified

1. `server/src/app.js` - CORS & rate limit middleware
2. `server/src/routes/auth.routes.js` - Validation on login/register
3. `server/src/routes/product.routes.js` - Product validation
4. `server/src/routes/chat.routes.js` - Chat message validation
5. `server/src/middlewares/rateLimit.middleware.js` - NEW
6. `server/src/middlewares/validate.js` - NEW
7. `server/.env.example` - Template for env vars
8. `server/.gitignore` - Prevent .env leakage
9. `server/package.json` - Added security dependencies

---

## ❓ FAQ

**Q: Why rate limiting per email instead of per IP?**
A: GNITS campus likely shares IPs (NAT, proxy). Per-email is more fair.

**Q: Can I disable rate limiting for testing?**
A: Yes, set `NODE_ENV=test` and it will skip all rate limits.

**Q: What if I need multiple frontend domains?**
A: Update CORS config:
```javascript
origin: [process.env.CLIENT_URL, "https://other-domain.com"],
```

**Q: Are passwords stored securely?**
A: Yes, bcrypt with 10 salt rounds (industry standard).

**Q: What about SQL injection?**
A: You're using MongoDB, so NoSQL injection is the risk - that's blocked by `express-mongo-sanitize`.

---

## 🎯 Next Steps

1. Test all endpoints with invalid data
2. Monitor rate limit headers in responses
3. Set up logging/monitoring for failed validations
4. Consider adding API key authentication for future microservices
5. Add JWT token refresh logic for better security

