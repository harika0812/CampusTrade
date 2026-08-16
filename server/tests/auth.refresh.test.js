import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import User from "../src/models/User.js";
import {
  hashRefreshToken,
  refreshToken,
  logoutUser,
} from "../src/controllers/auth.controller.js";
import { handleUnauthorizedError } from "../../client/src/api/axios.js";

const SECRET = process.env.JWT_SECRET || "test-secret";

const buildRefreshToken = (userId, expiresIn = "5d", overrides = {}) =>
  jwt.sign({ userId, jti: overrides.jti || `jti-${userId}`, type: "refresh" }, SECRET, { expiresIn });

const buildRes = () => {
  const res = {
    statusCode: 200,
    data: null,
    cookieData: null,
    clearCookieArgs: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    },
    cookie(name, value, options) {
      this.cookieData = { name, value, options };
      return this;
    },
    clearCookie(name, options) {
      this.clearCookieArgs = { name, options };
      return this;
    },
  };

  return res;
};

const buildFindByIdQuery = (user) => ({
  select() {
    return user;
  },
});

test("normal refresh rotates refresh token and issues new access token", async () => {
  const token = buildRefreshToken("user-1", "5d", { jti: "old-jti" });
  const user = {
    _id: "user-1",
    refreshTokenHash: hashRefreshToken(token),
    refreshTokenJti: "old-jti",
    async save() {
      return this;
    },
  };

  const originalFindById = User.findById;
  User.findById = () => buildFindByIdQuery(user);

  try {
    const req = { cookies: { refreshToken: token } };
    const res = buildRes();

    await refreshToken(req, res);

    assert.equal(res.statusCode, 200);
    assert.ok(res.data?.token);
    assert.ok(res.cookieData?.value);
    assert.notEqual(token, res.cookieData.value);
    assert.equal(user.refreshTokenHash, hashRefreshToken(res.cookieData.value));
    assert.equal(user.refreshTokenJti !== "old-jti", true);
    assert.equal(res.data.success, true);
  } finally {
    User.findById = originalFindById;
  }
});

test("expired refresh token is rejected", async () => {
  const expiredToken = buildRefreshToken("user-1", "-1s", { jti: "expired-jti" });
  const req = { cookies: { refreshToken: expiredToken } };
  const res = buildRes();

  await refreshToken(req, res);

  assert.equal(res.statusCode, 401);
  assert.equal(res.data.success, false);
});

test("invalid refresh token is rejected", async () => {
  const req = { cookies: { refreshToken: "not-a-valid-token" } };
  const res = buildRes();

  await refreshToken(req, res);

  assert.equal(res.statusCode, 401);
  assert.equal(res.data.message, "Invalid refresh token");
});

test("replay of an old rotated refresh token is rejected", async () => {
  const oldToken = buildRefreshToken("user-1", "5d", { jti: "old-jti" });
  const currentToken = buildRefreshToken("user-1", "5d", { jti: "new-jti" });
  const user = {
    _id: "user-1",
    refreshTokenHash: hashRefreshToken(currentToken),
    refreshTokenJti: "new-jti",
    async save() {
      return this;
    },
  };

  const originalFindById = User.findById;
  User.findById = () => buildFindByIdQuery(user);

  try {
    const req = { cookies: { refreshToken: oldToken } };
    const res = buildRes();

    await refreshToken(req, res);

    assert.equal(res.statusCode, 401);
    assert.equal(res.data.message, "Refresh token reused or invalid");
  } finally {
    User.findById = originalFindById;
  }
});

test("logout then refresh is rejected", async () => {
  const oldToken = buildRefreshToken("user-1", "5d", { jti: "logout-jti" });
  const user = {
    _id: "user-1",
    refreshTokenHash: hashRefreshToken(oldToken),
    refreshTokenJti: "logout-jti",
    async save() {
      return this;
    },
  };

  const originalFindById = User.findById;
  User.findById = () => buildFindByIdQuery(user);

  try {
    const logoutReq = { cookies: { refreshToken: oldToken } };
    const logoutRes = buildRes();
    await logoutUser(logoutReq, logoutRes);

    assert.equal(logoutRes.statusCode, 200);
    assert.equal(user.refreshTokenHash, null);
    assert.equal(user.refreshTokenJti, null);
    assert.ok(logoutRes.clearCookieArgs);

    const refreshReq = { cookies: { refreshToken: oldToken } };
    const refreshRes = buildRes();
    await refreshToken(refreshReq, refreshRes);

    assert.equal(refreshRes.statusCode, 401);
  } finally {
    User.findById = originalFindById;
  }
});

test("two concurrent API requests receiving 401 share one refresh and retry once", async () => {
  const originalLocalStorage = globalThis.localStorage;
  globalThis.localStorage = {
    store: new Map(),
    getItem(key) {
      return this.store.get(key) || null;
    },
    setItem(key, value) {
      this.store.set(key, String(value));
    },
    removeItem(key) {
      this.store.delete(key);
    },
  };

  let refreshCalls = 0;
  const refreshRequest = async () => {
    refreshCalls += 1;
    return { token: "fresh-access-token" };
  };

  const requestClient = async (config) => ({ config, ok: true });

  const first = handleUnauthorizedError(
    { response: { status: 401 }, config: { url: "/api/test", headers: { Authorization: "Bearer old-token" } } },
    requestClient,
    { refreshTokenRequest: refreshRequest }
  );

  const second = handleUnauthorizedError(
    { response: { status: 401 }, config: { url: "/api/test", headers: { Authorization: "Bearer old-token" } } },
    requestClient,
    { refreshTokenRequest: refreshRequest }
  );

  const [firstResult, secondResult] = await Promise.all([first, second]);

  assert.equal(refreshCalls, 1);
  assert.equal(firstResult.ok, true);
  assert.equal(secondResult.ok, true);
  globalThis.localStorage = originalLocalStorage;
});
