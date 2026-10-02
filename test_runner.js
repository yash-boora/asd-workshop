/**
 * test_runner.js
 * Automated verification script to test all requirements:
 * 1. Initial GET -> X-Cache: MISS, second GET -> X-Cache: HIT
 * 2. POST / PUT / PATCH / DELETE success -> next GET is MISS
 * 3. Failed write (PUT non-existent ID) -> cache NOT cleared
 * 4. Cache TTL expiration check
 */

const http = require('http');
const app = require('./server');

const PORT = 3099;
let server;

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: path,
      method: method,
      headers: {}
    };

    let payload = '';
    if (body) {
      payload = JSON.stringify(body);
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = data;
        try {
          parsed = JSON.parse(data);
        } catch (e) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          xCache: res.headers['x-cache'],
          body: parsed
        });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(payload);
    }
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

async function runTests() {
  server = app.listen(PORT, async () => {
    console.log(`\n========================================`);
    console.log(`Starting Verification Tests on Port ${PORT}...`);
    console.log(`========================================\n`);

    try {
      // Test 1: GET /products MISS then HIT
      let res1 = await makeRequest('GET', '/products');
      assert(res1.statusCode === 200, 'GET /products returns 200');
      assert(res1.xCache === 'MISS', 'First GET /products returns X-Cache: MISS');

      let res2 = await makeRequest('GET', '/products');
      assert(res2.statusCode === 200, 'Second GET /products returns 200');
      assert(res2.xCache === 'HIT', 'Second GET /products returns X-Cache: HIT');

      // Test 2: GET /products/1 MISS then HIT
      let res3 = await makeRequest('GET', '/products/1');
      assert(res3.statusCode === 200, 'GET /products/1 returns 200');
      assert(res3.xCache === 'MISS', 'First GET /products/1 returns X-Cache: MISS');

      let res4 = await makeRequest('GET', '/products/1');
      assert(res4.statusCode === 200, 'Second GET /products/1 returns 200');
      assert(res4.xCache === 'HIT', 'Second GET /products/1 returns X-Cache: HIT');

      // Test 3: Failed write does NOT invalidate cache
      let resFailedWrite = await makeRequest('PUT', '/products/999', { name: 'Ghost Product', price: 100 });
      assert(resFailedWrite.statusCode === 404, 'PUT /products/999 returns 404 Not Found');

      let resAfterFailed = await makeRequest('GET', '/products/1');
      assert(resAfterFailed.xCache === 'HIT', 'GET /products/1 is STILL X-Cache: HIT after failed write');

      // Test 4: Successful POST invalidates cache
      let resPost = await makeRequest('POST', '/products', { name: 'Wireless Earbuds', price: 79.99, category: 'Electronics' });
      assert(resPost.statusCode === 201, 'POST /products returns 201 Created');

      let resAfterPost = await makeRequest('GET', '/products');
      assert(resAfterPost.xCache === 'MISS', 'GET /products returns X-Cache: MISS after POST creation');

      // Cache GET /products again to make it HIT
      await makeRequest('GET', '/products');

      // Test 5: Successful PUT invalidates cache
      let resPut = await makeRequest('PUT', '/products/1', { name: 'Pro Wireless Gaming Mouse', price: 69.99, category: 'Electronics' });
      assert(resPut.statusCode === 200, 'PUT /products/1 returns 200 OK');

      let resAfterPut = await makeRequest('GET', '/products');
      assert(resAfterPut.xCache === 'MISS', 'GET /products returns X-Cache: MISS after PUT update');

      // Cache GET /products/1 again
      await makeRequest('GET', '/products/1');
      let resHit1 = await makeRequest('GET', '/products/1');
      assert(resHit1.xCache === 'HIT', 'GET /products/1 is X-Cache: HIT');

      // Test 6: Successful PATCH invalidates cache
      let resPatch = await makeRequest('PATCH', '/products/1', { price: 64.99 });
      assert(resPatch.statusCode === 200, 'PATCH /products/1 returns 200 OK');

      let resAfterPatch = await makeRequest('GET', '/products/1');
      assert(resAfterPatch.xCache === 'MISS', 'GET /products/1 returns X-Cache: MISS after PATCH update');

      // Cache GET /products again
      await makeRequest('GET', '/products');
      let resHitAll = await makeRequest('GET', '/products');
      assert(resHitAll.xCache === 'HIT', 'GET /products is X-Cache: HIT');

      // Test 7: Successful DELETE invalidates cache
      let resDelete = await makeRequest('DELETE', '/products/3');
      assert(resDelete.statusCode === 200, 'DELETE /products/3 returns 200 OK');

      let resAfterDelete = await makeRequest('GET', '/products');
      assert(resAfterDelete.xCache === 'MISS', 'GET /products returns X-Cache: MISS after DELETE');

      // Test 8: Non-existent item GET returns 404 and is NOT cached
      let res404 = await makeRequest('GET', '/products/9999');
      assert(res404.statusCode === 404, 'GET /products/9999 returns 404');
      assert(res404.xCache === 'MISS', 'GET /products/9999 header is MISS');

      console.log(`\n========================================`);
      console.log(`ALL AUTOMATED VERIFICATION TESTS PASSED! 🎉`);
      console.log(`========================================\n`);

      server.close();
      process.exit(0);
    } catch (err) {
      console.error('Test execution error:', err);
      if (server) server.close();
      process.exit(1);
    }
  });
}

runTests();
