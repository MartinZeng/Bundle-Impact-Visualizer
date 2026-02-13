const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from current directory (css, images)
app.use(express.static(__dirname));

// Send index.html for any request
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log('\n' + '='.repeat(50));
    console.log('BiV Website is running!');
    console.log('='.repeat(50));
    console.log(`Open: http://localhost:${port}`);
    console.log(`Serving from: ${__dirname}`);
    console.log(`Found: index.html, css/style.css`);
    console.log('='.repeat(50) + '\n');
});