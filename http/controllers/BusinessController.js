const {Business} = require("../../models");

/**
 * function that handles the creating of
 * a business
 * */
const create = async function(req, res){
    //get the user and the business data
    const user = req.user;
    const body = req.body;

    //create the business
    const [err, _business] = await To(Business.create({...body, user_id:user.id}));

    if(err)
        return ErrorResponse(res, err, 400);

    //return the newly created business
    return SuccessResponse(res, _business.toJson());
};

/**
 * function to get a users business
 * */
const get = async function (req, res){
    //get the user
    const user = req.user;
    const user_ref = req.query.user;

    if(!user_ref)
        return ErrorResponse(res, "user reference is required", 400);

    //check if the user is admin or is the actual user
    if(user.reference !== user_ref && !user.isAdmin)
        return ErrorResponse(res, "Not allowed to access", 400);
};

module.exports = {
  create
};