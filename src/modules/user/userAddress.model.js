userAddressSchema.index({ userId: 1 });
userAddressSchema.index({ isDefault: 1 });
userAddressSchema.index({ deletedAt: 1 });
userAddressSchema.index({ createdAt: -1 });