import mongoose from "mongoose";

const P2PWalletSchema = new mongoose.Schema(
  {
    // User reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Balance tracking
    balance: {
      availableCAD: {
        type: Number,
        default: 0,
        min: 0,
      },
      pendingCAD: {
        type: Number,
        default: 0,
        min: 0,
      },
      lockedCAD: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    // Trading statistics
    stats: {
      totalTrades: {
        type: Number,
        default: 0,
      },
      totalEnergyBought: {
        type: Number,
        default: 0,
      },
      totalEnergySold: {
        type: Number,
        default: 0,
      },
      totalSpending: {
        type: Number,
        default: 0,
      },
      totalEarnings: {
        type: Number,
        default: 0,
      },
      totalCO2SavedKg: {
        type: Number,
        default: 0,
      },
    },

    // Transaction history (for quick access)
    recentTransactions: [
      {
        type: {
          type: String,
          enum: ["trade", "deposit", "withdrawal"],
        },
        amount: Number,
        timestamp: Date,
        tradeId: mongoose.Schema.Types.ObjectId,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Method to check if user has sufficient balance
P2PWalletSchema.methods.hasSufficientBalance = function (amount) {
  return this.balance.availableCAD >= amount;
};

// Method to add funds (demo only)
P2PWalletSchema.methods.addFunds = async function (amount) {
  this.balance.availableCAD += amount;
  this.recentTransactions.unshift({
    type: "deposit",
    amount,
    timestamp: new Date(),
  });

  // Keep only last 10 transactions
  if (this.recentTransactions.length > 10) {
    this.recentTransactions = this.recentTransactions.slice(0, 10);
  }

  await this.save();
  return this;
};

// Method to withdraw funds (demo only)
P2PWalletSchema.methods.withdrawFunds = async function (amount) {
  if (!this.hasSufficientBalance(amount)) {
    throw new Error("Insufficient balance");
  }

  this.balance.availableCAD -= amount;
  this.recentTransactions.unshift({
    type: "withdrawal",
    amount: -amount,
    timestamp: new Date(),
  });

  if (this.recentTransactions.length > 10) {
    this.recentTransactions = this.recentTransactions.slice(0, 10);
  }

  await this.save();
  return this;
};

const P2PWallet = mongoose.model("P2PWallet", P2PWalletSchema);

export default P2PWallet;
