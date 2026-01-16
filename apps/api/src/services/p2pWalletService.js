import P2PWallet from "../models/P2PWallet.js";

class P2PWalletService {
  /**
   * Get or create wallet for user
   */
  async getOrCreateWallet(userId) {
    try {
      let wallet = await P2PWallet.findOne({ userId });

      if (!wallet) {
        wallet = new P2PWallet({
          userId,
          balance: {
            availableCAD: 0,
            pendingCAD: 0,
            lockedCAD: 0,
          },
        });
        await wallet.save();
        console.log(`✅ Created new P2P wallet for user: ${userId}`);
      }

      return wallet;
    } catch (error) {
      console.error("❌ Get or create wallet error:", error);
      throw error;
    }
  }

  /**
   * Add funds to wallet (demo only)
   */
  async addFunds(userId, amount) {
    try {
      const wallet = await this.getOrCreateWallet(userId);
      await wallet.addFunds(amount);

      console.log(`✅ Added ${amount} CAD to wallet: ${userId}`);

      return wallet;
    } catch (error) {
      console.error("❌ Add funds error:", error);
      throw error;
    }
  }

  /**
   * Withdraw funds from wallet (demo only)
   */
  async withdrawFunds(userId, amount) {
    try {
      const wallet = await this.getOrCreateWallet(userId);
      await wallet.withdrawFunds(amount);

      console.log(`✅ Withdrew ${amount} CAD from wallet: ${userId}`);

      return wallet;
    } catch (error) {
      console.error("❌ Withdraw funds error:", error);
      throw error;
    }
  }

  /**
   * Process trade payment (buyer pays, seller receives)
   */
  async processTrade(trade) {
    try {
      const [buyerWallet, sellerWallet] = await Promise.all([
        this.getOrCreateWallet(trade.buyerId),
        this.getOrCreateWallet(trade.sellerId),
      ]);

      // Check buyer has sufficient balance
      if (!buyerWallet.hasSufficientBalance(trade.buyerPaysCAD)) {
        throw new Error("Insufficient buyer balance");
      }

      // Deduct from buyer
      buyerWallet.balance.availableCAD -= trade.buyerPaysCAD;
      buyerWallet.stats.totalTrades += 1;
      buyerWallet.stats.totalEnergyBought += trade.energyKWh;
      buyerWallet.stats.totalSpending += trade.buyerPaysCAD;
      buyerWallet.stats.totalCO2SavedKg += trade.co2SavedKg;

      buyerWallet.recentTransactions.unshift({
        type: "trade",
        amount: -trade.buyerPaysCAD,
        timestamp: new Date(),
        tradeId: trade._id,
      });

      // Add to seller
      sellerWallet.balance.availableCAD += trade.sellerReceivesCAD;
      sellerWallet.stats.totalTrades += 1;
      sellerWallet.stats.totalEnergySold += trade.energyKWh;
      sellerWallet.stats.totalEarnings += trade.sellerReceivesCAD;
      sellerWallet.stats.totalCO2SavedKg += trade.co2SavedKg;

      sellerWallet.recentTransactions.unshift({
        type: "trade",
        amount: trade.sellerReceivesCAD,
        timestamp: new Date(),
        tradeId: trade._id,
      });

      // Trim transaction history
      if (buyerWallet.recentTransactions.length > 10) {
        buyerWallet.recentTransactions = buyerWallet.recentTransactions.slice(
          0,
          10
        );
      }
      if (sellerWallet.recentTransactions.length > 10) {
        sellerWallet.recentTransactions = sellerWallet.recentTransactions.slice(
          0,
          10
        );
      }

      await Promise.all([buyerWallet.save(), sellerWallet.save()]);

      console.log(`✅ Processed trade payment: ${trade._id}`);

      return { buyerWallet, sellerWallet };
    } catch (error) {
      console.error("❌ Process trade error:", error);
      throw error;
    }
  }

  /**
   * Get wallet stats
   */
  async getWalletStats(userId) {
    try {
      const wallet = await this.getOrCreateWallet(userId);

      return {
        balance: wallet.balance,
        stats: wallet.stats,
        netProfitLoss: wallet.stats.totalEarnings - wallet.stats.totalSpending,
      };
    } catch (error) {
      console.error("❌ Get wallet stats error:", error);
      throw error;
    }
  }
}

export default new P2PWalletService();
