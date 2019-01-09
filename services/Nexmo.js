const Nexmo = require('nexmo');

const nexmo = new Nexmo({
        apiKey: process.env.NEXMO_API_KEY || "",
        apiSecret: process.env.NEXMO_SECRET || "",
        applicationId: process.env.NEXMO_APP_ID || ""
    },
    {
        debug: process.env.APP_DEBUG || false
    });

module.exports = nexmo;