const auth = require("./authentication");
const v1 = require("./v1/index");

module.exports = (app) => {
    // setup CORS
    app.use((req, res, next) => {

        const allowedOrigins = ['http://localhost:3000','https://www.nauticplatform.com'];

        const origin = req.headers.referer || req.headers.origin;

        if(allowedOrigins.indexOf(origin) > -1){
            res.setHeader('Access-Control-Allow-Origin', origin);
        }else{
            res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
        }

        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization, Content-Type');
        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', true);
        // Pass to next layer of middleware
        next();
    });

    app.use('/auth', auth);
    app.use("/v1", v1);
};