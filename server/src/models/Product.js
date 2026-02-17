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

    category: {
      type: String,
      enum: ["Books", "Electronics", "Lab Equipment", "Notes", "Others"],
      default: "Others",
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
