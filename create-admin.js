const http = require('http');

const data = JSON.stringify({
    name: 'Admin User',
    email: 'admin@mfu.ac.th',
    password: 'admin123'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
        responseData += chunk;
    });

    res.on('end', () => {
        console.log('Response Status:', res.statusCode);
        console.log('Response:', JSON.parse(responseData));
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

req.write(data);
req.end();
