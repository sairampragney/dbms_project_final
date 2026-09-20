const app = require('../src/app');
const http = require('http');

const server = http.createServer(app);
server.listen(0, async () => {
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;
  const baseV1Url = `http://localhost:${port}/api/v1`;
  console.log(`Test server running on port ${port}`);

  try {
    const request = async (urlPath, method = 'GET', body = null, token = null) => {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${baseUrl}${urlPath}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
      });
      const data = await res.json();
      return { status: res.status, data };
    };

    // 1. Health Checks
    console.log('Testing GET /health & GET /v1/health...');
    const health1 = await request('/health');
    if (health1.status !== 200 || !health1.data.success) throw new Error('GET /api/health failed');

    const resV1 = await fetch(`${baseV1Url}/health`);
    const health2 = await resV1.json();
    if (resV1.status !== 200 || !health2.success) throw new Error('GET /api/v1/health failed');
    console.log('✅ Health endpoints verified on both /api and /api/v1');

    // 2. Auth Route Validation
    console.log('Testing Auth validation rules...');
    const regBad = await request('/auth/register', 'POST', { email: 'invalid_email' });
    if (regBad.status !== 400 || regBad.data.success !== false) throw new Error('Auth validation failed');
    console.log('✅ Auth validation rules verified');

    // 3. Incident Route Validation
    console.log('Testing Incident validation rules...');
    const incBad = await request('/incidents', 'POST', { disasterType: 'INVALID' });
    if (incBad.status !== 400) throw new Error('Incident validation failed');
    console.log('✅ Incident validation rules verified');

    // 4. Emergency Request Route Validation
    console.log('Testing Emergency Request validation rules...');
    const reqBad = await request('/emergency-requests', 'POST', { requestType: 'INVALID' });
    if (reqBad.status !== 400) throw new Error('Emergency request validation failed');
    console.log('✅ Emergency request validation rules verified');

    // 5. Auth Guards Verification
    console.log('Testing Auth guards on protected endpoints...');
    const prot1 = await request('/response-records');
    const prot2 = await request('/responses');
    const prot3 = await request('/alerts', 'POST', { title: 'Unauthorized Alert' });
    const prot4 = await request('/safe-locations', 'POST', { name: 'Unauthorized Shelter' });
    if (prot1.status !== 401 || prot2.status !== 401 || prot3.status !== 401 || prot4.status !== 401) {
      throw new Error('Auth guards failed');
    }
    console.log('✅ Protected endpoints auth guards verified');

    // 6. 404 Route Handler Verification
    console.log('Testing 404 handler for invalid routes...');
    const notFoundRes = await request('/invalid-route-xyz');
    if (notFoundRes.status !== 404 || notFoundRes.data.error.code !== 'NOT_FOUND') {
      throw new Error('404 error handler failed');
    }
    console.log('✅ 404 error handler verified');

    console.log('\n🎉 All Backend REST API Express Server Verification Tests Passed Successfully!');
    server.close(() => process.exit(0));
  } catch (err) {
    console.error('❌ API Verification Test Error:', err.message);
    server.close(() => process.exit(1));
  }
});
