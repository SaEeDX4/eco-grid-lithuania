import mongoose from "mongoose";

const P2PTradeSchema = new mongoose.Schema(
  {
    // Trade parties
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    buyerName: {
      type: String,
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerName: {
      type: String,
      required: true,
    },

    // Related offer
    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "P2POffer",
      required: true,
    },

    // Energy details
    energyKWh: {
      type: Number,
      required: true,
      min: 0,
    },
    pricePerKWh: {
      type: Number,
      required: true,
      min: 0,
    },

    // Financial details
    subtotalCAD: {
      type: Number,
      required: true,
    },
    platformFeeCAD: {
      type: Number,
      required: true,
      default: 0,
    },
    blockchainFeeCAD: {
      type: Number,
      required: true,
      default: 0.25,
    },
    totalCAD: {
      type: Number,
      required: true,
    },
    sellerReceivesCAD: {
      type: Number,
      required: true,
    },
    buyerPaysCAD: {
      type: Number,
      required: true,
    },

    // Settlement details
    settlementStatus: {
      type: String,
      enum: ["pending", "confirmed", "failed"],
      default: "pending",
    },
    txHash: {
      type: String,
    },
    blockNumber: {
      type: Number,
    },
    network: {
      type: String,
      default: "EcoGrid-Testnet",
    },
    gasUsed: {
      type: String,
      default: "21000",
    },

    // Impact
    co2SavedKg: {
      type: Number,
      default: 0,
    },

    // Location
    region: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
P2PTradeSchema.index({ buyerId: 1, createdAt: -1 });
P2PTradeSchema.index({ sellerId: 1, createdAt: -1 });
P2PTradeSchema.index({ settlementStatus: 1 });
P2PTradeSchema.index({ createdAt: -1 });

// Pre-save hook to calculate fees and totals
P2PTradeSchema.pre("save", function (next) {
  if (this.isNew) {
    this.subtotalCAD = this.energyKWh * this.pricePerKWh;
    this.platformFeeCAD = this.subtotalCAD * 0.025; // 2.5%
    this.blockchainFeeCAD = 0.25; // Fixed fee
    this.totalCAD =
      this.subtotalCAD + this.platformFeeCAD + this.blockchainFeeCAD;
    this.buyerPaysCAD = this.totalCAD;
    this.sellerReceivesCAD = this.subtotalCAD - this.platformFeeCAD;
  }
  next();
});

const P2PTrade = mongoose.model("P2PTrade", P2PTradeSchema);

export default P2PTrade;
