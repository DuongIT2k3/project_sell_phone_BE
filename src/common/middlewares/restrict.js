import MESSAGES from "../constants/messages";
import createError from "../utils/error";

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