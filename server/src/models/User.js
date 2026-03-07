import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    password: {
      type: String,
      required: true,
      minlength: 6
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },

    rollNo: {
      type: String,
      trim: true,
      default: ""
    },

    className: {
      type: String,
      trim: true,
      default: ""
    },

    branch: {
      type: String,
      trim: true,
      default: ""
    },

    year: {
      type: String,
      trim: true,
      default: ""
    },

    upiQrUrl: {
      type: String,
      trim: true,
      default: ""
    },

    isVerified: {
      type: Boolean,
      default: false
    }
    ,
    verificationToken: {
      type: String,
      default: null
    },

    verificationTokenExpires: {
      type: Date,
      default: null
    },

    resetPasswordToken: {
      type: String,
      default: null
    },

    resetPasswordExpires: {
      type: Date,
      default: null
    },

    razorpayAccountId: {
      type: String,
      default: null,
      trim: true
    },

    isSeller: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Cascade delete products and messages when user is deleted
userSchema.pre("deleteOne", { document: true, query: false }, async function () {
  const Product = mongoose.model("Product");
  const Message = mongoose.model("Message");
  
  // Delete all products created by this user
  await Product.deleteMany({ sellerId: this._id });
  
  // Delete all messages sent by or received by this user
  await Message.deleteMany({
    $or: [
      { sender: this._id },
      { receiver: this._id }
    ]
  });
});

// Also handle findOneAndDelete and findByIdAndDelete
userSchema.pre("findOneAndDelete", async function () {
  const Product = mongoose.model("Product");
  const Message = mongoose.model("Message");
  
  const user = await this.model.findOne(this.getQuery());
  if (user) {
    await Product.deleteMany({ sellerId: user._id });
    await Message.deleteMany({
      $or: [
        { sender: user._id },
        { receiver: user._id }
      ]
    });
  }
});

// Compare password
userSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
