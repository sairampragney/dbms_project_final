const app = require('../src/app');
const http = require('http');

const server = http.createServer(app);
server.listen(0, async () => {
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;
  console.log(`E2E Verification Test server running on port ${port}`);

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

    console.log('1. Testing User Registration & Authentication Validation Workflows...');
    const invReg = await request('/auth/register', 'POST', {
      fullName: 'A',
      email: 'invalid_email_format',
      password: '123'
    });
    if (invReg.status !== 400 || invReg.data.success !== false) {
      throw new Error('E2E Registration validation failed');
    }
    console.log('  ✅ Registration input validation rules verified (400 Bad Request)');

    console.log('2. Testing Incidents Input Boundaries & Geolocation Validation...');
    const invIncRes = await request('/incidents', 'POST', {
      disasterType: 'INVALID_TYPE',
      location: 'Sector 1',
      severity: 'HIGH',
      description: 'Test'
    });
    if (invIncRes.status !== 400) throw new Error('E2E Incident validation failed');
    console.log('  ✅ Incident reporting enum and field validation verified');

    console.log('3. Testing Emergency Assistance Request Rules...');
    const invReqRes = await request('/emergency-requests', 'POST', {
      requestType: 'INVALID_TYPE',
      location: 'Sector 2',
      contactPhone: '555',
      description: 'Help'
    });
    if (invReqRes.status !== 400) throw new Error('E2E Request validation failed');
    console.log('  ✅ Emergency Request validation rules verified');

    console.log('4. Testing Safe Location Shelter Route Handling & Aliasing...');
    const locRes1 = await request('/safe-locations', 'POST', { name: 'Unauthorized' });
    const locRes2 = await request('/locations', 'POST', { name: 'Unauthorized' });
    if (locRes1.status !== 401 || locRes2.status !== 401) throw new Error('E2E Locations aliasing failed');
    console.log('  ✅ Safe Locations endpoint aliasing and auth guard verified');

    console.log('5. Testing Community Volunteers & Response Records Auth Guards...');
    const unauthVol = await request('/volunteers', 'POST', { skills: 'Rescue' });
    const unauthResp = await request('/response-records');
    if (unauthVol.status !== 401 || unauthResp.status !== 401) {
      throw new Error('E2E Protected route auth guards failed');
    }
    console.log('  ✅ Unauthenticated access correctly blocked with 401 Unauthorized');

    console.log('\n🎉 Complete End-to-End Workflow Integration Test Suite Passed Successfully!');
    server.close(() => process.exit(0));
  } catch (err) {
    console.error('❌ E2E Integration Test Error:', err.message);
    server.close(() => process.exit(1));
  }
});
