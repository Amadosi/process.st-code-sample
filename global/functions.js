/**
 * Function to parse error
 * */
const pe = require('parse-error');

/**
 * Function for returning a promise
 * */
To = (promise) => {
    return promise
        .then(data => {
            return [null, data];
        }).catch(err =>
            [pe(err)]
        );
};

/**
 * Function for throwing error
 * */
ThrowError = (err_message, log) => {
    if(log === true){
        console.error(err_message);
    }

    throw new Error(err_message);
};

/**
 * Function for handling error web
 * responses
 * */
ErrorResponse = (res, err, code) =>{ // Error Web Response
    if(typeof err === 'object' && typeof err.message !== 'undefined'){
        err = err.message;
    }

    if(typeof code !== 'undefined') res.statusCode = code;

    return res.json({success:false, error: err});
};

/**
 * Function for handling success web
 * responses
 * */
SuccessResponse = (res, message, data, code=200) => { // Success Web Response
    let send_data = {
        success:true, message
    };

    if(typeof data === 'object'){
        send_data = Object.assign({data}, send_data);//merge the objects
    }
    //set the http status code
    res.statusCode = code;

    return res.json(send_data)
};

/**
 * Function to handle all the uncaught
 * promise rejections
 * */
process.on('unhandledRejection', error => {
    console.error('Uncaught Error', pe(error));
});