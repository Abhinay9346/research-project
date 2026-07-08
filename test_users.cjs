const http = require('http');

const roles = [
  { role: 'admin', userName: 'Admin User', scholarId: '' },
  { role: 'chairman', userName: 'Chairman User', scholarId: '' },
  { role: 'guide', userName: 'Guide User', scholarId: '' },
  { role: 'scholar', userName: 'Scholar User', scholarId: 'S1' }
];

async function runTests() {
  for (const r of roles) {
    await new Promise(resolve => {
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/users',
        method: 'GET',
        headers: {
          'x-user-role': r.role,
          'x-user-name': r.userName,
          'x-scholar-id': r.scholarId
        }
      };

      const req = http.request(options, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log(`[${r.role.toUpperCase()}] GET /api/users -> Status: ${res.statusCode}`);
          resolve();
        });
      });
      req.on('error', e => {
        console.error(`[${r.role.toUpperCase()}] Error: ${e.message}`);
        resolve();
      });
      req.end();
    });
  }
}

runTests();
