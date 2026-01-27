const http = require('http');

const data = JSON.stringify({
    name: 'Student User',
    email: 'user@mfu.ac.th',
    password: 'user123',
    role: 'user'
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

console.log('Creating user account...');
console.log('Email: user@mfu.ac.th');
console.log('Password: user123');
console.log('Role: user');
console.log('---');

const req = http.request(options, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
        responseData += chunk;
    });

    res.on('end', () => {
        console.log('Response Status:', res.statusCode);
        try {
            const parsed = JSON.parse(responseData);
            console.log('Response:', JSON.stringify(parsed, null, 2));

            if (res.statusCode === 201) {
                console.log('\n✅ User account created successfully!');
                console.log('You can now login with:');
                console.log('  Email: user@mfu.ac.th');
                console.log('  Password: user123');
            } else {
                console.log('\n❌ Failed to create user account');
            }
        } catch (error) {
            console.log('Response:', responseData);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Error:', error.message);
    console.error('Make sure the backend server is running on http://localhost:5000');
});

req.write(data);
req.end();
