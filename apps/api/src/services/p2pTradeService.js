import P2PTrade from "../models/P2PTrade.js";
import P2POffer from "../models/P2POffer.js";
import blockchainSimulator from "./blockchainSimulator.js";
import p2pWalletService from "./p2pWalletService.js";
import p2pImpactService from "./p2pImpactService.js";

// ✅ ADD: cache invalidation services (ESM-safe)
import p2pCommunityService from "./p2pCommunityService.js";
import p2pLeaderboardService from "./p2pLeaderboardService.js";
import p2pAnalyticsService from "./p2pAnalyticsService.js";

class P2PTradeService {
  /**
   * Execute trade between buyer and offer
   */
  async executeTrade(buyerId, buyerName, tradeData) {
    try {
      const { offerId, energyKWh } = tradeData;

      // Get and validate offer
      const offer = await P2POffer.findById(offerId);

      if (!offer) {
        throw new Error("Offer not found");
      }

      if (!offer.isValid()) {
        throw new Error("Offer is no longer available");
      }

      if (energyKWh > offer.remainingKWh) {
        throw new Error(`Only ${offer.remainingKWh} kWh available`);
      }

      // Validate trade based on offer type
      if (offer.type === "sell") {
        if (offer.ownerId.toString() === buyerId.toString()) {
          throw new Error("Cannot buy from your own offer");
        }
      } else {
        if (offer.ownerId.toString() === buyerId.toString()) {
          throw new Error("Cannot sell to your own offer");
        }
      }

      // Check partial match allowed
      if (!offer.preferences.partialMatch && energyKWh < offer.energyKWh) {
        throw new Error("Partial matches not allowed for this offer");
      }

      // Check minimum match
      if (
        offer.preferences.minMatchKWh &&
        energyKWh < offer.preferences.minMatchKWh
      ) {
        throw new Error(
          `Minimum match is ${offer.preferences.minMatchKWh} kWh`
        );
      }

      // Determine buyer and seller based on offer type
      let sellerId, sellerName;
      if (offer.type === "sell") {
        sellerId = offer.ownerId;
        sellerName = offer.ownerName;
      } else {
        sellerId = buyerId;
        sellerName = buyerName;
        buyerId = offer.ownerId;
        buyerName = offer.ownerName;
      }

      // Calculate CO2 saved
      const co2SavedKg = p2pImpactService.calculateCO2Saved(
        energyKWh,
        offer.source
      );

      // Simulate blockchain settlement
      const settlement = await blockchainSimulator.settleTrade({
        sellerId,
        buyerId,
        energyKWh,
        pricePerKWh: offer.pricePerKWh,
      });

      // Create trade record
      const trade = new P2PTrade({
        buyerId,
        buyerName,
        sellerId,
        sellerName,
        offerId: offer._id,
        energyKWh,
        pricePerKWh: offer.pricePerKWh,
        txHash: settlement.txHash,
        blockNumber: settlement.blockNumber,
        network: settlement.network,
        gasUsed: settlement.gasUsed,
        settlementStatus: settlement.status,
        co2SavedKg,
        region: offer.region,
      });

      await trade.save();

      // Process wallet payments
      await p2pWalletService.processTrade(trade);

      // Update offer
      offer.remainingKWh -= energyKWh;

      if (offer.remainingKWh === 0) {
        offer.status = "matched";
      } else if (offer.remainingKWh < offer.energyKWh) {
        offer.status = "partial";
      }

      await offer.save();

      // ✅ ADD: invalidate Phase 3 caches AFTER successful trade
      p2pCommunityService.invalidateCaches();
      p2pLeaderboardService.invalidateCaches();
      p2pAnalyticsService.invalidateCaches();

      console.log(`✅ Trade executed: ${trade._id} (${energyKWh} kWh)`);

      return trade;
    } catch (error) {
      console.error("❌ Execute trade error:", error);
      throw error;
    }
  }

  /**
   * Get trade by ID
   */
  async getTradeById(tradeId) {
    try {
      const trade = await P2PTrade.findById(tradeId).lean();

      if (!trade) {
        throw new Error("Trade not found");
      }

      return trade;
    } catch (error) {
      console.error("❌ Get trade error:", error);
      throw error;
    }
  }

  /**
   * Get user's trades
   */
  async getUserTrades(userId, filters = {}) {
    try {
      const query = {
        $or: [{ buyerId: userId }, { sellerId: userId }],
      };

      if (filters.role === "buyer") {
        query.$or = [{ buyerId: userId }];
      } else if (filters.role === "seller") {
        query.$or = [{ sellerId: userId }];
      }

      const trades = await P2PTrade.find(query)
        .sort({ createdAt: -1 })
        .limit(filters.limit || 100)
        .lean();

      return trades.map((trade) => ({
        ...trade,
        userRole:
          trade.buyerId.toString() === userId.toString() ? "buyer" : "seller",
      }));
    } catch (error) {
      console.error("❌ Get user trades error:", error);
      throw error;
    }
  }

  /**
   * Get trade statistics
   */
  async getTradeStats(userId) {
    try {
      const trades = await this.getUserTrades(userId);

      const buyTrades = trades.filter((t) => t.userRole === "buyer");
      const sellTrades = trades.filter((t) => t.userRole === "seller");

      return {
        totalTrades: trades.length,
        buyTrades: buyTrades.length,
        sellTrades: sellTrades.length,
        totalEnergyBought: buyTrades.reduce((s, t) => s + t.energyKWh, 0),
        totalEnergySold: sellTrades.reduce((s, t) => s + t.energyKWh, 0),
        totalSpending: buyTrades.reduce((s, t) => s + t.buyerPaysCAD, 0),
        totalEarnings: sellTrades.reduce((s, t) => s + t.sellerReceivesCAD, 0),
        totalCO2SavedKg: trades.reduce((s, t) => s + t.co2SavedKg, 0),
      };
    } catch (error) {
      console.error("❌ Get trade stats error:", error);
      throw error;
    }
  }

  /**
   * Get trade receipt (for display)
   */
  async getTradeReceipt(tradeId) {
    try {
      const trade = await this.getTradeById(tradeId);
      return blockchainSimulator.generateFullReceipt(trade);
    } catch (error) {
      console.error("❌ Get trade receipt error:", error);
      throw error;
    }
  }
}

export default new P2PTradeService();
