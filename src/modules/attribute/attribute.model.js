import mongoose from "mongoose";

const attributeSchema = new mongoose.Schema(
  {
    attributeName: {
      type: String,
      required: true,
      unique: true,
    },
    attributeCode: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      required: true,
      enum: ['string', 'number','enum']
    },
    enumValues: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    deletedAt:{
      type: Date, 
      default: null,
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

attributeSchema.index({ attributeCode: 1 }, { unique: true });
attributeSchema.index({ isActive: 1 });
attributeSchema.index({ deletedAt: 1 });
attributeSchema.index({ createdAt: -1 });

const Attribute = mongoose.model("Attribute", attributeSchema);

export default Attribute;
