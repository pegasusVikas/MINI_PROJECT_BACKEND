const app = require('./app');
const HOST = process.env.HOST || 'http://localhost';
//const HOST = process.env.HOST || '192.168.1.4';
const PORT = process.env.PORT || 4000;

app.listen(PORT,()=>{
    console.log(`Running on http://${HOST}:${PORT}`);
});


