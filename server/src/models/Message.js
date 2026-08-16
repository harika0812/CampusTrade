import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    },

    message: {
      type: String,
      required: true
    },

    clientMessageId: {
      type: String,
      trim: true,
      default: null,
    },

    deliveredAt: {
      type: Date,
      default: null
    },

    readAt: {
      type: Date,
      default: null
    },

    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  { timestamps: true }
);

// Virtual field to determine message status
messageSchema.virtual('status').get(function() {
  if (this.readAt) return 'read';
  if (this.deliveredAt) return 'delivered';
  return 'sent';
});

// Ensure virtuals are included in JSON
messageSchema.set('toJSON', { virtuals: true });
messageSchema.set('toObject', { virtuals: true });

messageSchema.index(
  { sender: 1, clientMessageId: 1 },
  {
    unique: true,
    partialFilterExpression: { clientMessageId: { $type: "string" } },
  }
);

export default mongoose.model("Message", messageSchema);
