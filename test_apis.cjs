const http = require('http');
const endpoints = [
  '/weekly-logs',
  '/publications',
  '/committee-meetings',
  '/announcements',
  '/dashboard/stats',
  '/users',
  '/research-projects',
  '/guide-explanations',
  '/chairman-reviews'
];

async function testApi(endpoint) {
  return new Promise((resolve) => {
    http.get('http://localhost:5000/api' + endpoint, { headers: { 'x-user-role': 'admin' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`[ ${res.statusCode} ] ${endpoint} => success: ${json.success}, data length: ${Array.isArray(json.data) ? json.data.length : 'object'}`);
        } catch(e) {
          console.log(`[ ${res.statusCode} ] ${endpoint} => Parse Error: ${data.substring(0, 50)}`);
        }
        resolve();
      });
    }).on('error', (err) => {
      console.log(`[ ERROR ] ${endpoint} => ${err.message}`);
      resolve();
    });
  });
}

(async () => {
  for (const ep of endpoints) {
    await testApi(ep);
  }
})();
