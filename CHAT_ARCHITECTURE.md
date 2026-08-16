# CAMPUSTRADE CHAT ARCHITECTURE

## Overview
CampusTrade includes a real-time chat module that allows buyers and sellers to communicate directly about listings, orders, and negotiation.

## How Chat Works
1. The React frontend opens a chat UI for a selected conversation.
2. The client connects to the Socket.io server for real-time messaging.
3. REST APIs are used to fetch conversation history and message status.
4. Socket.io handles live message delivery, room joining, and read receipts.

## Main Components
- Frontend chat UI: React component-based interface
- Socket client: `socket.io-client`
- Backend socket server: `socket.io`
- Message persistence: MongoDB via Mongoose
- Email/notification support: Nodemailer and related backend flows

## Message Flow
1. User sends a message from the frontend.
2. The backend validates the message payload.
3. The message is stored in MongoDB.
4. The server broadcasts the message to the relevant Socket.io room.
5. The receiver sees the message instantly in the chat UI.

## Read Receipt Flow
1. A user marks messages as read.
2. The backend updates the message status in MongoDB.
3. A read event is broadcast to the active chat room.

## Technical Notes
- Chat is designed as a real-time negotiation channel between users.
- The architecture combines REST APIs for history retrieval and Socket.io for instant delivery.
- MongoDB stores persistent chat records for message history and status tracking.
