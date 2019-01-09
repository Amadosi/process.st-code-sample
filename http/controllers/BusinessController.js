const {Business} = require("../../models");

/**
 * function that handles the creating of
 * a business
 * */
const create = async function (req, res) {
    //get the user and the business data
    const user = req.user;
    const body = req.body;

    //create the business
    const [err, _business] = await To(Business.findOrCreate({
        where: {user_id: user.id},
        defaults: {...body}
    }).spread((business, created) => business));

    if (err)
        return ErrorResponse(res, err, 400);

    //return the newly created business
    return SuccessResponse(res, _business.toJSON());
};

/**
 * function to get a users business
 * */
const get = async function (req, res) {
    //get the user
    const user = req.user;

    //get the business of the user
    let [err, business] = await To(Business.findOne({where: {user_id: user.id}}));

    if (err)
        return ErrorResponse(res, err, 400);

    if (!business)
        return ErrorResponse(res, "no business found", 404);

    return SuccessResponse(res, "business fetched", business.toJSON());
};

module.exports = {
    create,
    get
};