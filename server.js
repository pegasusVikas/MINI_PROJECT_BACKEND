const app = require('./app');

const HOST = process.env.HOST || '192.168.1.7';
const PORT = process.env.PORT || 4000;

app.listen(PORT,()=>{
    console.log(`Running on http://${HOST}:${PORT}`);
});


