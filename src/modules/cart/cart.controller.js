import handleAsync from "../../common/utils/handleAsync.js"

export const updateCart = handleAsync(async (req, res, next) => {
    const user = req.user;
    console.log("cart: ",user)
})

export const getCart = handleAsync(async(req,res,next) => {})

export const deleteCart = handleAsync(async(req,res,next) => {})