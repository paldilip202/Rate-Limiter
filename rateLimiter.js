const _ = require('lodash');

class RateLimiter {
  constructor(strategy, options) {
    this.strategy = strategy;
    this.options = options;
    this.clients = new Map(); // Track client states
  }

  getClient(key) {
    if (!this.clients.has(key)) {
      const initialState = {
        tokens: this.options.tokens || 0,
        lastReset: Date.now(),
        requestCount: 0,
        requests: [] // Initialize for sliding window
      };
      this.clients.set(key, initialState);
    }
    return this.clients.get(key);
  }

  async checkRateLimit(key) {
    const client = this.getClient(key);
    const now = Date.now();
    const { strategy, options } = this;

    if (strategy === 'tokenBucket') {
      return this._checkTokenBucket(client, now, options);
    } else if (strategy === 'fixedWindow') {
      return this._checkFixedWindow(client, now, options);
    } else if (strategy === 'slidingWindow') {
      return this._checkSlidingWindow(client, now, options);
    } else {
      throw new Error('Unknown strategy');
    }
  }

  _checkTokenBucket(client, now, options) {
    const elapsed = now - client.lastReset;
    const tokens = Math.min(options.maxTokens, client.tokens + (elapsed / options.refillInterval) * options.refillRate);
    if (tokens >= 1) {
      client.tokens = tokens - 1;
      client.lastReset = now;
      return true;
    }
    return false;
  }

  _checkFixedWindow(client, now, options) {
    const windowStart = Math.floor(now / options.windowSize) * options.windowSize;
    if (client.lastReset < windowStart) {
      client.requestCount = 0;
      client.lastReset = windowStart;
    }
    if (client.requestCount < options.maxRequests) {
      client.requestCount++;
      return true;
    }
    return false;
  }

  _checkSlidingWindow(client, now, options) {
    const windowSize = options.windowSize;
    if (!client.requests) {
      client.requests = [];
    }
    client.requests = client.requests.filter(timestamp => now - timestamp < windowSize);
    if (client.requests.length < options.maxRequests) {
      client.requests.push(now);
      return true;
    }
    return false;
  }
}

module.exports = RateLimiter;
