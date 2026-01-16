import mongoose from "mongoose";

const P2POfferSchema = new mongoose.Schema(
  {
    // Offer basics
    type: {
      type: String,
      enum: ["sell", "buy"],
      required: true,
    },

    // Owner
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    ownerName: {
      type: String,
      required: true,
    },

    // Energy details
    energyKWh: {
      type: Number,
      required: true,
      min: 1,
      max: 1000,
    },
    remainingKWh: {
      type: Number,
      required: true,
      min: 0,
    },

    // Pricing
    pricePerKWh: {
      type: Number,
      required: true,
      min: 0.05,
      max: 0.5,
    },
    totalPriceCAD: {
      type: Number,
      required: true,
    },

    // Location
    region: {
      type: String,
      required: true,
      index: true,
    },
    city: {
      type: String,
    },
    postalCode: {
      type: String,
    },

    // Optional metadata
    title: {
      type: String,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    source: {
      type: String,
      enum: ["solar", "wind", "battery", "grid", "mixed", null],
      default: null,
    },

    // Status
    status: {
      type: String,
      enum: ["open", "partial", "matched", "cancelled", "expired"],
      default: "open",
      index: true,
    },

    // Preferences
    preferences: {
      partialMatch: {
        type: Boolean,
        default: true,
      },
      minMatchKWh: {
        type: Number,
        default: 1,
      },
      preferredHours: {
        type: [Number], // 0-23
        default: [],
      },
    },

    // Engagement metrics
    viewCount: {
      type: Number,
      default: 0,
    },
    interestedCount: {
      type: Number,
      default: 0,
    },

    // Expiry
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
P2POfferSchema.index({ type: 1, status: 1, region: 1 });
P2POfferSchema.index({ ownerId: 1, status: 1 });
P2POfferSchema.index({ createdAt: -1 });
P2POfferSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual
P2POfferSchema.virtual("remainingValueCAD").get(function () {
  return this.remainingKWh * this.pricePerKWh;
});

// Pre-save hook
P2POfferSchema.pre("save", function (next) {
  if (this.isModified("energyKWh") || this.isModified("pricePerKWh")) {
    this.totalPriceCAD = this.energyKWh * this.pricePerKWh;
  }

  if (this.isNew) {
    this.remainingKWh = this.energyKWh;
  }

  next();
});

// Instance method
P2POfferSchema.methods.isValid = function () {
  return (
    (this.status === "open" || this.status === "partial") &&
    this.expiresAt > new Date()
  );
};

// Static method
P2POfferSchema.statics.expireOldOffers = async function () {
  const result = await this.updateMany(
    {
      status: { $in: ["open", "partial"] },
      expiresAt: { $lte: new Date() },
    },
    {
      $set: { status: "expired" },
    }
  );

  if (result.modifiedCount > 0) {
    console.log(`✅ Expired ${result.modifiedCount} old P2P offers`);
  }

  return result;
};

const P2POffer = mongoose.model("P2POffer", P2POfferSchema);

export default P2POffer;
