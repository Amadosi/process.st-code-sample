const auth = require("./authentication");
const v1 = require("./v1/index");
const url = require('url');

module.exports = (app) => {
    // setup CORS
    app.use((req, res, next) => {

        const allowedOrigins = ['http://localhost:3000','https://www.nauticplatform.com'];

        const origin = req.headers.origin || req.headers.referer;

        console.log(url.parse(origin).host);


        if(allowedOrigins.indexOf("http://"+url.parse(origin).host) > -1 ){
            res.setHeader('Access-Control-Allow-Origin', "http://"+url.parse(origin).host);
        }else if(allowedOrigins.indexOf("https://"+url.parse(origin).host) > -1){
            res.setHeader('Access-Control-Allow-Origin', "https://"+url.parse(origin).host);
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