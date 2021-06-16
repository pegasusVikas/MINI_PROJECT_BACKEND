const app = require('./app');

<<<<<<< HEAD
const HOST = process.env.HOST || 'http://localhost';
=======
const HOST = process.env.HOST || '192.168.1.5';
>>>>>>> f17ad1a6ffa865ef6e19c5ccee8b2a76ca4483ff
const PORT = process.env.PORT || 4000;

app.listen(PORT,()=>{
    console.log(`Running on http://${HOST}:${PORT}`);
});


