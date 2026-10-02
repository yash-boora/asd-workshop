/**
 * test_ttl.js
 * Verifies TTL expiration logic on cacheStore
 */

const cacheStore = require('./cache/cacheStore');
const assert = require('assert');

console.log('Testing TTL Expiration logic...');

// Override TTL for fast testing (200 ms)
cacheStore.ttl = 200;

// Set entry
cacheStore.set('/products/test', { id: 1, name: 'Test Product' });

// Immediate check -> should be HIT
assert.strictEqual(cacheStore.has('/products/test'), true, 'Entry should exist immediately');
assert.notStrictEqual(cacheStore.get('/products/test'), null, 'Data should be retrievable');
console.log('✅ Immediate retrieval verified');

// Wait 250 ms -> should expire
setTimeout(() => {
  console.log('Checking after 250ms delay...');
  const exists = cacheStore.has('/products/test');
  assert.strictEqual(exists, false, 'Entry should be expired and removed after 250ms');
  assert.strictEqual(cacheStore.get('/products/test'), null, 'get() should return null after expiration');
  console.log('✅ TTL Expiration test passed successfully! 🎉');
  process.exit(0);
}, 250);
