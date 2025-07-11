import MESSAGES from "../constants/messages.js";
import createError from "../utils/error.js";

const restrict = (roles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return next(createError(401, MESSAGES.GENERAL.UNAUTHORIZED));
        }

        if (!roles.includes(user.role)) {
            return next(createError(403, MESSAGES.GENERAL.FORBIDDEN));
        }
         next();
    };
};
export default restrict;