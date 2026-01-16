import P2PTrade from "../models/P2PTrade.js";
import P2POffer from "../models/P2POffer.js";
import P2PWallet from "../models/P2PWallet.js";
import p2pImpactService from "./p2pImpactService.js";
import cacheHelper from "../utils/cacheHelper.js";

class P2PCommunityService {
  constructor() {
    this.CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get overall community impact
   */
  async getCommunityImpact() {
    const cacheKey = "community:impact";
    const cached = cacheHelper.get(cacheKey);
    if (cached) return cached;

    try {
      const trades = await P2PTrade.find({
        settlementStatus: "confirmed",
      }).lean();

      const totalEnergy = trades.reduce((sum, t) => sum + t.energyKWh, 0);
      const totalCO2 = trades.reduce((sum, t) => sum + t.co2SavedKg, 0);
      const totalValue = trades.reduce((sum, t) => sum + t.subtotalCAD, 0);

      const uniqueParticipants = new Set();
      trades.forEach((t) => {
        uniqueParticipants.add(t.buyerId.toString());
        uniqueParticipants.add(t.sellerId.toString());
      });

      const impact = {
        totalTrades: trades.length,
        totalEnergySharedKWh: totalEnergy,
        totalCO2SavedKg: totalCO2,
        totalValueCAD: totalValue,
        activeParticipants: uniqueParticipants.size,

        // Calculated equivalents
        treesEquivalent: p2pImpactService.calculateTreesEquivalent(totalCO2),
        evKilometers: p2pImpactService.calculateEVKilometers(totalEnergy),
        homeDaysPowered: p2pImpactService.calculateHomeDaysPowered(totalEnergy),

        // Grid relief
        gridReliefKWh: totalEnergy,

        // Averages
        avgTradeSize: trades.length > 0 ? totalEnergy / trades.length : 0,
        avgTradeValue: trades.length > 0 ? totalValue / trades.length : 0,
        avgPricePerKWh: totalEnergy > 0 ? totalValue / totalEnergy : 0,
      };

      cacheHelper.set(cacheKey, impact, this.CACHE_TTL);
      return impact;
    } catch (error) {
      console.error("❌ Get community impact error:", error);
      throw error;
    }
  }

  /**
   * Get regional breakdown
   */
  async getRegionalBreakdown() {
    const cacheKey = "community:regions";
    const cached = cacheHelper.get(cacheKey);
    if (cached) return cached;

    try {
      const trades = await P2PTrade.find({
        settlementStatus: "confirmed",
      }).lean();

      const regionStats = {};

      trades.forEach((trade) => {
        const region = trade.region || "Unknown";

        if (!regionStats[region]) {
          regionStats[region] = {
            region,
            totalTrades: 0,
            totalEnergyKWh: 0,
            totalValueCAD: 0,
            totalCO2SavedKg: 0,
            avgPricePerKWh: 0,
          };
        }

        regionStats[region].totalTrades++;
        regionStats[region].totalEnergyKWh += trade.energyKWh;
        regionStats[region].totalValueCAD += trade.subtotalCAD;
        regionStats[region].totalCO2SavedKg += trade.co2SavedKg;
      });

      Object.values(regionStats).forEach((stats) => {
        if (stats.totalEnergyKWh > 0) {
          stats.avgPricePerKWh = stats.totalValueCAD / stats.totalEnergyKWh;
        }
      });

      const sortedRegions = Object.values(regionStats).sort(
        (a, b) => b.totalEnergyKWh - a.totalEnergyKWh
      );

      cacheHelper.set(cacheKey, sortedRegions, this.CACHE_TTL);
      return sortedRegions;
    } catch (error) {
      console.error("❌ Get regional breakdown error:", error);
      throw error;
    }
  }

  /**
   * Get market statistics
   */
  async getMarketStats() {
    const cacheKey = "community:market";
    const cached = cacheHelper.get(cacheKey);
    if (cached) return cached;

    try {
      const [totalOffers, activeOffers, avgOfferPrice, trades] =
        await Promise.all([
          P2POffer.countDocuments(),
          P2POffer.countDocuments({ status: { $in: ["open", "partial"] } }),
          P2POffer.aggregate([
            { $match: { status: { $in: ["open", "partial"] } } },
            { $group: { _id: null, avgPrice: { $avg: "$pricePerKWh" } } },
          ]),
          P2PTrade.find({ settlementStatus: "confirmed" })
            .sort({ createdAt: -1 })
            .limit(100)
            .lean(),
        ]);

      const recentTrades = trades.slice(0, 20);
      const avgRecentPrice = recentTrades.length
        ? recentTrades.reduce((sum, t) => sum + t.pricePerKWh, 0) /
          recentTrades.length
        : 0;

      const stats = {
        totalOffers,
        activeOffers,
        avgOfferPricePerKWh: avgOfferPrice[0]?.avgPrice || 0,
        avgTradePricePerKWh: avgRecentPrice,
        recentTradesCount: recentTrades.length,
        localTradesPercentage: trades.length
          ? (trades.length / trades.length) * 100
          : 0,
        avgDistanceKm: 15,
      };

      cacheHelper.set(cacheKey, stats, this.CACHE_TTL);
      return stats;
    } catch (error) {
      console.error("❌ Get market stats error:", error);
      throw error;
    }
  }

  /**
   * Get recent activity feed
   */
  async getActivityFeed(limit = 10) {
    const cacheKey = `community:activity:${limit}`;
    const cached = cacheHelper.get(cacheKey);
    if (cached) return cached;

    try {
      const [recentTrades, recentOffers] = await Promise.all([
        P2PTrade.find({ settlementStatus: "confirmed" })
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean(),
        P2POffer.find({ status: { $in: ["open", "partial"] } })
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean(),
      ]);

      const activities = [
        ...recentTrades.map((t) => ({
          type: "trade",
          timestamp: t.createdAt,
          energyKWh: t.energyKWh,
          pricePerKWh: t.pricePerKWh,
          region: t.region,
          co2SavedKg: t.co2SavedKg,
        })),
        ...recentOffers.map((o) => ({
          type: "offer",
          offerType: o.type,
          timestamp: o.createdAt,
          energyKWh: o.remainingKWh,
          pricePerKWh: o.pricePerKWh,
          region: o.region,
        })),
      ]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);

      cacheHelper.set(cacheKey, activities, 60 * 1000);
      return activities;
    } catch (error) {
      console.error("❌ Get activity feed error:", error);
      throw error;
    }
  }

  /**
   * Invalidate all community caches
   */
  invalidateCaches() {
    cacheHelper.invalidatePattern("^community:");
    console.log("✅ Community caches invalidated");
  }
}

export default new P2PCommunityService();
