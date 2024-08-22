const RateLimiter = require('./rateLimiter');

// Example configuration
const tokenBucketOptions = {
  tokens: 10,
  refillRate: 1,
  refillInterval: 1000,
  maxTokens: 10
};

const fixedWindowOptions = {
  maxRequests: 5,
  windowSize: 60000 // 1 minute
};

const slidingWindowOptions = {
  maxRequests: 5,
  windowSize: 60000 // 1 minute
};

// Create rate limiter instances
const tokenBucketLimiter = new RateLimiter('tokenBucket', tokenBucketOptions);
const fixedWindowLimiter = new RateLimiter('fixedWindow', fixedWindowOptions);
const slidingWindowLimiter = new RateLimiter('slidingWindow', slidingWindowOptions);

// Example usage
const testRateLimiter = async (limiter) => {
  for (let i = 0; i < 10; i++) {
    if (await limiter.checkRateLimit('user1')) {
      console.log('Request allowed');
    } else {
      console.log('Rate limit exceeded');
    }
    await new Promise(resolve => setTimeout(resolve, 100)); // simulate request interval
  }
};

testRateLimiter(tokenBucketLimiter);
testRateLimiter(fixedWindowLimiter);
testRateLimiter(slidingWindowLimiter);
