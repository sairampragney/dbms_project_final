const app = require('../src/app');
const http = require('http');

const server = http.createServer(app);
server.listen(0, async () => {
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/v1`;
  console.log(`Test server running on port ${port}`);

  try {
    const request = async (method, path, body = null, token = null) => {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${baseUrl}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
      });
      const data = await res.json();
      return { status: res.status, data };
    };

    // 1. Health Endpoint Test
    console.log('Testing GET /health...');
    const health = await request('GET', '/health');
    if (health.status !== 200 || !health.data.success) throw new Error('Health check failed');
    console.log('✅ Health check passed');

    // 2. Auth Route Registration Validation Test
    console.log('Testing POST /auth/register validation...');
    const regBad = await request('POST', '/auth/register', { email: 'bademail' });
    if (regBad.status !== 400 || regBad.data.success !== false) throw new Error('Auth validation failed');
    console.log('✅ Auth Register validation test passed');

    // 3. Alerts Route Auth Guard Test
    console.log('Testing POST /alerts auth guard...');
    const alertUnauth = await request('POST', '/alerts', { title: 'Test Alert' });
    if (alertUnauth.status !== 401) throw new Error('Alert auth guard failed');
    console.log('✅ Alert auth guard passed');

    // 4. Incidents Route Validation Test
    console.log('Testing POST /incidents validation...');
    const incBad = await request('POST', '/incidents', { disasterType: 'INVALID' });
    if (incBad.status !== 400) throw new Error('Incident validation failed');
    console.log('✅ Incident validation test passed');

    // 5. Emergency Requests Route Validation Test
    console.log('Testing POST /requests validation...');
    const reqBad = await request('POST', '/requests', { requestType: 'INVALID' });
    if (reqBad.status !== 400) throw new Error('Request validation failed');
    console.log('✅ Request validation test passed');

    // 6. Safe Locations Route Auth Guard Test
    console.log('Testing POST /locations auth guard...');
    const locUnauth = await request('POST', '/locations', { name: 'Shelter' });
    if (locUnauth.status !== 401) throw new Error('Location auth guard failed');
    console.log('✅ Safe location auth guard passed');

    // 7. Volunteers Route Auth Guard Test
    console.log('Testing POST /volunteers auth guard...');
    const volUnauth = await request('POST', '/volunteers', { skills: 'First Aid' });
    if (volUnauth.status !== 401) throw new Error('Volunteer auth guard failed');
    console.log('✅ Volunteer auth guard passed');

    // 8. Responses Route Auth Guard Test
    console.log('Testing GET /responses auth guard...');
    const respUnauth = await request('GET', '/responses');
    if (respUnauth.status !== 401) throw new Error('Responses auth guard failed');
    console.log('✅ Responses auth guard passed');

    console.log('\n🎉 All Backend REST API Server Verification Tests Passed Successfully!');
    server.close(() => process.exit(0));
  } catch (err) {
    console.error('❌ API Verification Test Error:', err.message);
    server.close(() => process.exit(1));
  }
});
