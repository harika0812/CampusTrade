# CAMPUSTRADE — TECHNICAL ARCHITECTURE & IMPLEMENTATION OVERVIEW

## 1. PROJECT OVERVIEW & CORE STACK
- CampusTrade is a localized peer-to-peer campus marketplace where verified college students buy, sell, rent, or borrow items (textbooks, lab gear, electronics) within their campus.
- Core Stack: MongoDB, Express.js, React.js, Node.js (MERN), REST APIs, Socket.io, Cloudinary, Nodemailer.

## 2. TECHNOLOGY PLACEMENT & RESPONSIBILITIES
- React.js (Frontend): UI rendering, client-side routing, state management, form handling, image upload forms, and real-time chat interface.
- Node.js & Express.js (Backend): Central REST API engine, routing, controller logic, middleware chains, authentication verification, and server orchestration.
- MongoDB & Mongoose ORM: Database persistent storage. Manages document models for Users, Listings, Conversations, Messages, and Transactions using indexes for fast lookup.
- REST APIs: HTTP communication layer connecting the React frontend to Express backend endpoints for authentication, listings, chats, and user profiles.
- Socket.io (`socket.io` and `socket.io-client`): Full-duplex WebSocket layer handling instant peer-to-peer chat, live room events, and real-time negotiation.
- Cloudinary: Media management service used for uploading, processing, storing, and delivering item listing images.
- Nodemailer: Email dispatch service used for sending verification emails, OTPs, and transactional notifications to users.

## 3. TECHNICAL USER FLOWS & LAYER INTERACTIONS

### 1. Campus Email Authentication & Verification
- User inputs an institutional email restricted to the campus domain.
- Backend hashes the password using bcrypt and generates a verification token or OTP.
- Nodemailer dispatches the verification message to the user’s email.
- Upon verification, JWT tokens are issued for subsequent authenticated REST API requests.

### 2. Media Upload & Listing Creation
- User fills out item details and attaches images on the React frontend.
- The frontend/backend submits the image to Cloudinary for secure upload and retrieval of a public image URL.
- Express processes the listing metadata and Cloudinary image URLs, validates the payload, and creates a document in MongoDB through Mongoose.

### 3. Real-Time Chat & Live Negotiation Flow
- Buyer clicks “Chat with Seller” to initialize or retrieve a conversation via the REST API.
- The client establishes a WebSocket connection using Socket.io, with authentication validated through the server.
- The client emits `join_room` for a specific `conversationId`.
- The message dispatch sequence follows `send_message -> server persistence in MongoDB -> broadcast receive_message to the room -> ACK to sender`.
- Read receipt handling follows `mark_read -> update message status in MongoDB -> notify the room`.

## 4. DATABASE SCHEMAS & MONGOOSE MODELS
- User Schema: Name, campus email, password hash, verification status, rating, timestamps.
- Listing Schema: Seller ID, title, description, category, listing type (SELL/BORROW/RENT), price, condition, Cloudinary image URLs array, status (AVAILABLE/RESERVED/SOLD).
- Conversation Schema: Array of participant User IDs, listing reference ID, last message metadata, timestamps.
- Message Schema: Conversation ID, sender ID, message content, status (SENT/READ), timestamp.
- Transaction Schema: Listing ID, buyer ID, seller ID, agreed price, status (PENDING/COMPLETED/CANCELLED).

## 5. EDGE CASES & TECHNICAL HANDLING

### 1. Simultaneous Booking / Item Availability
- Item availability is protected by atomic Mongoose database operations such as `findOneAndUpdate` with a condition like `status: 'AVAILABLE'` to prevent double-selling and race conditions.

### 2. Socket Disconnections
- Socket disconnections are handled by client-side pending message states and temporary IDs so messages are not lost during transient network drops.

### 3. Auth Token Expiration
- Expired sessions are handled through client-side request interceptors that detect 401 responses and trigger a fresh authentication flow.

### 4. Email Delivery Failures
- Email delivery failures are handled through Nodemailer error logging and retry-oriented error handling so registration codes and transactional emails can be reattempted safely.
