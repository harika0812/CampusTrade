import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";

import { persistMessageIdempotent } from "../src/controllers/chat.controller.js";
import { isAuthorizedRoomJoin, verifySocketToken } from "../src/sockets/chat.helpers.js";
import {
  applyDeliveredReceiptToMessages,
  applyReadReceiptToMessages,
  buildConversationKey,
  filterMessagesSince,
  getLastSeen,
  mergeMessagesById,
  setLastSeen,
} from "../../client/src/features/chat/chatSync.js";

class InMemoryMessageModel {
  constructor() {
    this.records = [];
  }

  async findOne(query) {
    return (
      this.records.find(
        (item) => String(item.sender) === String(query.sender) && String(item.clientMessageId) === String(query.clientMessageId)
      ) || null
    );
  }

  async create(payload) {
    const created = {
      _id: `m_${this.records.length + 1}`,
      createdAt: new Date().toISOString(),
      ...payload,
    };
    this.records.push(created);
    return created;
  }
}

test("normal send persists one message", async () => {
  const model = new InMemoryMessageModel();

  const result = await persistMessageIdempotent({
    MessageModel: model,
    senderId: "sender-1",
    receiverId: "receiver-1",
    productId: null,
    message: "Hello",
    clientMessageId: "cid-1",
  });

  assert.equal(result.duplicate, false);
  assert.equal(model.records.length, 1);
  assert.equal(model.records[0].message, "Hello");
});

test("duplicate retry reuses existing message", async () => {
  const model = new InMemoryMessageModel();

  await persistMessageIdempotent({
    MessageModel: model,
    senderId: "sender-1",
    receiverId: "receiver-1",
    productId: null,
    message: "Hello",
    clientMessageId: "cid-1",
  });

  const duplicate = await persistMessageIdempotent({
    MessageModel: model,
    senderId: "sender-1",
    receiverId: "receiver-1",
    productId: null,
    message: "Hello",
    clientMessageId: "cid-1",
  });

  assert.equal(duplicate.duplicate, true);
  assert.equal(model.records.length, 1);
});

test("unauthorized socket token is rejected", () => {
  assert.throws(() => verifySocketToken({ token: "bad-token", secret: "secret" }));

  const token = jwt.sign({ userId: "u1" }, "secret");
  const userId = verifySocketToken({ token, secret: "secret" });
  assert.equal(userId, "u1");
});

test("unauthorized room join is blocked", () => {
  const unauthorized = isAuthorizedRoomJoin({
    authUserId: "auth-1",
    otherUserId: "other-1",
    claimedUserId: "different-user",
  });

  const authorized = isAuthorizedRoomJoin({
    authUserId: "auth-1",
    otherUserId: "other-1",
    claimedUserId: "auth-1",
  });

  assert.equal(unauthorized, false);
  assert.equal(authorized, true);
});

test("offline reconnect sync keeps marker and fetches only missed messages", () => {
  const storage = new Map();
  const storageLike = {
    getItem: (key) => storage.get(key) || "",
    setItem: (key, value) => storage.set(key, value),
  };

  const key = buildConversationKey("u1", "u2");
  setLastSeen(storageLike, key, "2026-08-16T10:00:00.000Z");

  const since = getLastSeen(storageLike, key);
  const all = [
    { _id: "m1", createdAt: "2026-08-16T09:59:00.000Z" },
    { _id: "m2", createdAt: "2026-08-16T10:00:01.000Z" },
    { _id: "m3", createdAt: "2026-08-16T10:05:00.000Z" },
  ];

  const missed = filterMessagesSince(all, since);
  assert.equal(missed.length, 2);
  assert.equal(missed[0]._id, "m2");
  assert.equal(missed[1]._id, "m3");
});

test("duplicate socket event does not append duplicate message", () => {
  const existing = [{ _id: "m1", message: "hello", createdAt: "2026-08-16T10:00:00.000Z" }];
  const incoming = [
    { _id: "m1", message: "hello", createdAt: "2026-08-16T10:00:00.000Z" },
    { _id: "m2", message: "new", createdAt: "2026-08-16T10:00:05.000Z" },
  ];

  const merged = mergeMessagesById(existing, incoming);
  assert.equal(merged.length, 2);
  assert.equal(merged[1]._id, "m2");
});

test("read receipt updates only messages sent by me to the peer", () => {
  const messages = [
    {
      _id: "m1",
      sender: { _id: "u1" },
      receiver: "u2",
      readAt: null,
      deliveredAt: null,
      createdAt: "2026-08-16T10:00:00.000Z",
    },
    {
      _id: "m2",
      sender: { _id: "u2" },
      receiver: "u1",
      readAt: null,
      deliveredAt: null,
      createdAt: "2026-08-16T10:00:01.000Z",
    },
  ];

  const updated = applyReadReceiptToMessages(messages, "u2", "u1", "u2");
  assert.ok(updated[0].readAt);
  assert.ok(updated[0].deliveredAt);
  assert.equal(updated[1].readAt, null);
});

test("delivered receipt updates target message only", () => {
  const messages = [
    { _id: "m1", deliveredAt: null, createdAt: "2026-08-16T10:00:00.000Z" },
    { _id: "m2", deliveredAt: null, createdAt: "2026-08-16T10:00:01.000Z" },
  ];

  const updated = applyDeliveredReceiptToMessages(messages, "m2");
  assert.equal(updated[0].deliveredAt, null);
  assert.ok(updated[1].deliveredAt);
});
