const restrict = (roles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(403).json({
                success: false,
                message: "Access denied. User not authenticated."
            });
        }

        if (!roles.includes(user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You do not have the required permissions."
            });
        }
         next();
    }
}