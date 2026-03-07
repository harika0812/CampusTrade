// // import mongoose from "mongoose";

// // const productSchema = new mongoose.Schema(
// //   {
// //     title: {
// //       type: String,
// //       required: true,
// //       trim: true
// //     },
// //     description: {
// //       type: String,
// //       required: true
// //     },
// //     price: {
// //       type: Number,
// //       required: true
// //     },
// //     category: {
// //       type: String,
// //       enum: ["Books", "Electronics", "Lab Equipment", "Notes", "Others"],
// //       default: "Others"
// //     },
// //     images: {
// //       type: [String],
// //       default: []
// //     },
// //     seller: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: "User",
// //       required: true
// //     },
// //     isSold: {
// //       type: Boolean,
// //       default: false
// //     }
// //   },
// //   { timestamps: true }
// // );

// // export default mongoose.model("Product", productSchema);
// import mongoose from "mongoose";

// const productSchema = new mongoose.Schema(
//   {
//     title: { type: String, required: true, trim: true },
//     description: { type: String, required: true },
//     price: { type: Number, required: true },
//     category: {
//       type: String,
//       enum: ["Books", "Electronics", "Lab Equipment", "Notes", "Others"],
//       default: "Others"
//     },
//     images: { type: [String], default: [] },

//     seller: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true
//     },

//     isSold: { type: Boolean, default: false }
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Product", productSchema);
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    availableCopies: { type: Number, required: true, min: 0, default: 1 },
    listingType: {
      type: String,
      enum: ["sell", "lend", "both"],
      default: "sell",
    },
    paymentOption: {
      type: String,
      enum: ["cod", "upi", "both"],
      default: "both",
    },
    paymentDetails: {
      upiId: { type: String, trim: true, default: "" },
      upiQrUrl: { type: String, trim: true, default: "" },
    },
    lendingDetails: {
      borrowFee: { type: Number, min: 0, default: 0 },
      maxDurationDays: { type: Number, min: 1, default: 7 },
      terms: { type: String, trim: true, default: "" },
    },

    category: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
      match: /^[A-Za-z][A-Za-z0-9-]*$/,
    },

    images: { type: [String], required: true, },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isSold: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
