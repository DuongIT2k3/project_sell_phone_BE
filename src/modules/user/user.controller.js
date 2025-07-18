import handleAsync from "../../common/utils/handleAsync.js";
import createResponse from "../../common/utils/response.js";
import createError from "../../common/utils/error.js";
import  MESSAGES  from "../../common/constants/messages.js";
import User from "./user.model.js";
import mongoose from "mongoose";

// Lấy profile của user hiện tại
export const getProfile = handleAsync(async (req, res, next) => {
    const user = req.user;
    
    const userProfile = await User.findById(user._id).select('-password -refreshToken');
    
    if (!userProfile) {
        return next(createError(404, MESSAGES.USER.NOT_FOUND));
    }

    return createResponse(res, 200, MESSAGES.USER.GET_BY_ID_SUCCESS, userProfile);
});

// Cập nhật profile của user hiện tại
export const updateProfile = handleAsync(async (req, res, next) => {
    const user = req.user;
    const { fullName, phoneNumber, address, bios, avatar } = req.body;

    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (address !== undefined) updateData.address = address;
    if (bios !== undefined) updateData.bios = bios;
    if (avatar !== undefined) updateData.avatar = avatar;

    const updatedUser = await User.findByIdAndUpdate(
        user._id,
        updateData,
        { new: true, runValidators: true }
    ).select('-password -refreshToken');

    return createResponse(res, 200, MESSAGES.USER.UPDATE_SUCCESS, updatedUser);
});

// Lấy danh sách users (Admin only)
export const getAllUsers = handleAsync(async (req, res, next) => {
    const { page = 1, limit = 10, search, role, isActive } = req.query;

    const skip = (page - 1) * limit;
    const query = {};

    // Search theo fullName hoặc email
    if (search) {
        query.$or = [
            { fullName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    // Filter theo role
    if (role) {
        query.role = role;
    }

    // Filter theo trạng thái active
    if (isActive !== undefined) {
        query.isActive = isActive === 'true';
    }

    const [users, total] = await Promise.all([
        User.find(query)
            .select('-password -refreshToken')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        User.countDocuments(query)
    ]);

    const meta = {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
    };

    return createResponse(res, 200, MESSAGES.USER.GET_SUCCESS, { users, meta });
});

// Lấy thông tin user theo ID (Admin only)
export const getUserById = handleAsync(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, MESSAGES.USER.INVALID_ID));
    }

    const user = await User.findById(id).select('-password -refreshToken');
    
    if (!user) {
        return next(createError(404, MESSAGES.USER.NOT_FOUND));
    }

    return createResponse(res, 200, MESSAGES.USER.GET_BY_ID_SUCCESS, user);
});

// Cập nhật thông tin user (Admin only)
export const updateUser = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    const { fullName, phoneNumber, address, bios, avatar, role, isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, MESSAGES.USER.INVALID_ID));
    }

    const user = await User.findById(id);
    if (!user) {
        return next(createError(404, MESSAGES.USER.NOT_FOUND));
    }

    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (address !== undefined) updateData.address = address;
    if (bios !== undefined) updateData.bios = bios;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedUser = await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    ).select('-password -refreshToken');

    return createResponse(res, 200, MESSAGES.USER.UPDATE_SUCCESS, updatedUser);
});

// Deactivate user (Admin only)
export const deactivateUser = handleAsync(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, MESSAGES.USER.INVALID_ID));
    }

    const user = await User.findById(id);
    if (!user) {
        return next(createError(404, MESSAGES.USER.NOT_FOUND));
    }

    if (user.role === 'superAdmin') {
        return next(createError(403, MESSAGES.USER.CANNOT_DEACTIVATE_SUPER_ADMIN));
    }

    user.isActive = false;
    await user.save();

    return createResponse(res, 200, MESSAGES.USER.DEACTIVATE_SUCCESS, null);
});

// Activate user (Admin only)
export const activateUser = handleAsync(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, MESSAGES.USER.INVALID_ID));
    }

    const user = await User.findById(id);
    if (!user) {
        return next(createError(404, MESSAGES.USER.NOT_FOUND));
    }

    user.isActive = true;
    await user.save();

    return createResponse(res, 200, MESSAGES.USER.ACTIVATE_SUCCESS, null);
});

// Lấy thống kê users (Admin only)
export const getUserStatistics = handleAsync(async (req, res, next) => {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const memberUsers = await User.countDocuments({ role: 'member' });
    const superAdminUsers = await User.countDocuments({ role: 'superAdmin' });
    
    // Thống kê theo tháng (12 tháng gần nhất)
    const monthlyStats = [];
    for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const count = await User.countDocuments({
            createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        });
        
        monthlyStats.push({
            month: startOfMonth.toISOString().substring(0, 7), // YYYY-MM format
            count
        });
    }
    
    const statistics = {
        totalUsers,
        activeUsers,
        inactiveUsers,
        adminUsers,
        memberUsers,
        superAdminUsers,
        monthlyRegistrations: monthlyStats
    };

    return createResponse(res, 200, "Lấy thống kê users thành công", statistics);
});

// Hard delete user (Admin only - permanent deletion)
export const deleteUser = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    const currentUser = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, MESSAGES.USER.INVALID_ID));
    }

    // Security checks
    if (id === currentUser._id.toString()) {
        return next(createError(400, "Không thể xóa chính mình"));
    }

    const user = await User.findById(id);
    if (!user) {
        return next(createError(404, MESSAGES.USER.NOT_FOUND));
    }

    if (user.role === 'superAdmin' && currentUser.role !== 'superAdmin') {
        return next(createError(403, "Không thể xóa Super Admin"));
    }

    await User.findByIdAndDelete(id);
    return createResponse(res, 200, "Xóa user vĩnh viễn thành công", null);
});

// Soft delete user (Admin only)
export const softDeleteUser = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    const currentUser = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, MESSAGES.USER.INVALID_ID));
    }

    if (id === currentUser._id.toString()) {
        return next(createError(400, "Không thể xóa chính mình"));
    }

    const user = await User.findById(id);
    if (!user) {
        return next(createError(404, MESSAGES.USER.NOT_FOUND));
    }

    if (user.deletedAt) {
        return next(createError(400, "User đã bị xóa"));
    }

    if (user.role === 'superAdmin' && currentUser.role !== 'superAdmin') {
        return next(createError(403, "Không thể xóa Super Admin"));
    }

    user.deletedAt = new Date();
    user.deletedBy = currentUser._id;
    await user.save();

    return createResponse(res, 200, "Xóa mềm user thành công", null);
});

// Restore deleted user (Admin only)
export const restoreUser = handleAsync(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, MESSAGES.USER.INVALID_ID));
    }

    const user = await User.findOne({ 
        _id: id, 
        deletedAt: { $ne: null } 
    }).setOptions({ includeDeleted: true });
    
    if (!user) {
        return next(createError(404, "User đã xóa không tồn tại"));
    }

    user.deletedAt = null;
    user.deletedBy = null;
    await user.save();

    return createResponse(res, 200, "Khôi phục user thành công", user);
});

// Get deleted users (Admin only)
export const getDeletedUsers = handleAsync(async (req, res, next) => {
    const { page = 1, limit = 10, search, role } = req.query;
    const skip = (page - 1) * limit;
    
    const query = { deletedAt: { $ne: null } };
    
    // Search theo fullName hoặc email
    if (search) {
        query.$or = [
            { fullName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    // Filter theo role
    if (role) {
        query.role = role;
    }

    const [users, total] = await Promise.all([
        User.find(query)
            .setOptions({ includeDeleted: true })
            .populate('deletedBy', 'fullName email')
            .select('-password -refreshToken')
            .sort({ deletedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        User.countDocuments(query)
    ]);

    const meta = {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
    };

    return createResponse(res, 200, "Lấy danh sách user đã xóa thành công", { users, meta });
});

// Bulk soft delete users (Admin only)
export const bulkSoftDeleteUsers = handleAsync(async (req, res, next) => {
    const { ids } = req.body;
    const currentUser = req.user;

    if (!Array.isArray(ids) || ids.length === 0) {
        return next(createError(400, "Vui lòng cung cấp danh sách ID"));
    }

    // Security check - không thể xóa chính mình
    if (ids.includes(currentUser._id.toString())) {
        return next(createError(400, "Không thể xóa chính mình"));
    }

    const users = await User.find({ _id: { $in: ids } });
    
    // Check permissions
    for (const user of users) {
        if (user.role === 'superAdmin' && currentUser.role !== 'superAdmin') {
            return next(createError(403, `Không thể xóa Super Admin: ${user.fullName}`));
        }
    }

    await User.updateMany(
        { _id: { $in: ids }, deletedAt: null },
        { 
            deletedAt: new Date(),
            deletedBy: currentUser._id
        }
    );

    return createResponse(res, 200, `Xóa mềm ${users.length} users thành công`, null);
});

// Bulk restore users (Admin only)
export const bulkRestoreUsers = handleAsync(async (req, res, next) => {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
        return next(createError(400, "Vui lòng cung cấp danh sách ID"));
    }

    const result = await User.updateMany(
        { _id: { $in: ids }, deletedAt: { $ne: null } },
        { 
            deletedAt: null,
            deletedBy: null
        }
    );

    return createResponse(res, 200, `Khôi phục ${result.modifiedCount} users thành công`, null);
});
