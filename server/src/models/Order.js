import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    },

    items: [
      {
        productId: mongoose.Schema.Types.ObjectId,
        quantity: { type: Number, default: 1 }
      }
    ],

    amount: {
      type: Number,
      required: true
    },

    meetupPlace: {
      type: String,
      trim: true,
      default: ""
    },

    status: {
      type: String,
      enum: ["pending", "paid", "cancelled"],
      default: "pending"
    },

    checkoutKey: {
      type: String,
      default: null,
      index: true,
    },

    inventoryReservedAtCheckout: {
      type: Boolean,
      default: false,
    },

    inventoryRestored: {
      type: Boolean,
      default: false,
    },

    paymentMode: {
      type: String,
      enum: ["online", "offline"],
      default: "online"
    },

    offlinePaymentMethod: {
      type: String,
      enum: ["cod", "upi"],
      default: null,
    },

    offlineStatus: {
      type: String,
      enum: ["placed", "accepted", "scheduled", "completed", "cancelled"]
    },

    offlinePaymentConfirmation: {
      confirmedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      confirmedAt: {
        type: Date,
        default: null,
      },
      note: {
        type: String,
        trim: true,
        default: "",
      },
    },

    razorpayOrderId: {
      type: String,
      default: null
    },

    paymentId: {
      type: String,
      default: null
    },

    signature: {
      type: String,
      default: null
    },

    paidAt: {
      type: Date,
      default: null
    },

    sellerBreakdown: [
      {
        seller: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        items: [
          {
            productId: mongoose.Schema.Types.ObjectId,
            title: String,
            price: Number,
            quantity: Number,
            imageUrl: String,
            category: String,
            description: String
          }
        ],
        amount: Number,
        transferStatus: {
          type: String,
          enum: ["pending", "completed", "failed"],
          default: "pending"
        },
        transferId: String
      }
    ],

    transfers: [
      {
        seller: mongoose.Schema.Types.ObjectId,
        transferId: String,
        amount: Number,
        status: String
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
