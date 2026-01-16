import P2PTrade from "../models/P2PTrade.js";
import cacheHelper from "../utils/cacheHelper.js";

class P2PAnalyticsService {
  constructor() {
    this.CACHE_TTL = 10 * 60 * 1000; // 10 minutes
  }

  /**
   * Get price trends over time
   */
  async getPriceTrends(timeRange = "30d") {
    const cacheKey = `analytics:price:${timeRange}`;
    const cached = cacheHelper.get(cacheKey);
    if (cached) return cached;

    try {
      const days = this.parseDaysFromRange(timeRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const trades = await P2PTrade.find({
        settlementStatus: "confirmed",
        createdAt: { $gte: startDate },
      })
        .sort({ createdAt: 1 })
        .lean();

      const priceByDay = {};
      trades.forEach((trade) => {
        const dateKey = trade.createdAt.toISOString().split("T")[0];

        if (!priceByDay[dateKey]) {
          priceByDay[dateKey] = {
            date: dateKey,
            prices: [],
            trades: 0,
            totalEnergy: 0,
          };
        }

        priceByDay[dateKey].prices.push(trade.pricePerKWh);
        priceByDay[dateKey].trades++;
        priceByDay[dateKey].totalEnergy += trade.energyKWh;
      });

      const trends = Object.values(priceByDay).map((day) => ({
        date: day.date,
        avgPrice: day.prices.reduce((sum, p) => sum + p, 0) / day.prices.length,
        minPrice: Math.min(...day.prices),
        maxPrice: Math.max(...day.prices),
        trades: day.trades,
        energyKWh: day.totalEnergy,
      }));

      const result = {
        timeRange,
        dataPoints: trends,
        summary: {
          avgPrice:
            trends.length > 0
              ? trends.reduce((sum, t) => sum + t.avgPrice, 0) / trends.length
              : 0,
          minPrice:
            trends.length > 0 ? Math.min(...trends.map((t) => t.minPrice)) : 0,
          maxPrice:
            trends.length > 0 ? Math.max(...trends.map((t) => t.maxPrice)) : 0,
          totalTrades: trends.reduce((sum, t) => sum + t.trades, 0),
          totalEnergy: trends.reduce((sum, t) => sum + t.energyKWh, 0),
        },
      };

      cacheHelper.set(cacheKey, result, this.CACHE_TTL);
      return result;
    } catch (error) {
      console.error("❌ Get price trends error:", error);
      throw error;
    }
  }

  /**
   * Get volume trends
   */
  async getVolumeTrends(timeRange = "30d") {
    const cacheKey = `analytics:volume:${timeRange}`;
    const cached = cacheHelper.get(cacheKey);
    if (cached) return cached;

    try {
      const days = this.parseDaysFromRange(timeRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const trades = await P2PTrade.aggregate([
        {
          $match: {
            settlementStatus: "confirmed",
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            totalEnergy: { $sum: "$energyKWh" },
            totalValue: { $sum: "$subtotalCAD" },
            tradeCount: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const trends = trades.map((day) => ({
        date: day._id,
        energyKWh: day.totalEnergy,
        valueCAD: day.totalValue,
        trades: day.tradeCount,
      }));

      const result = {
        timeRange,
        dataPoints: trends,
        summary: {
          totalEnergy: trends.reduce((sum, t) => sum + t.energyKWh, 0),
          totalValue: trends.reduce((sum, t) => sum + t.valueCAD, 0),
          totalTrades: trends.reduce((sum, t) => sum + t.trades, 0),
          avgDailyEnergy:
            trends.length > 0
              ? trends.reduce((sum, t) => sum + t.energyKWh, 0) / trends.length
              : 0,
        },
      };

      cacheHelper.set(cacheKey, result, this.CACHE_TTL);
      return result;
    } catch (error) {
      console.error("❌ Get volume trends error:", error);
      throw error;
    }
  }

  /**
   * Get market insights
   */
  async getMarketInsights() {
    const cacheKey = "analytics:insights";
    const cached = cacheHelper.get(cacheKey);
    if (cached) return cached;

    try {
      const [recentTrades, oldTrades] = await Promise.all([
        P2PTrade.find({
          settlementStatus: "confirmed",
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        }).lean(),
        P2PTrade.find({
          settlementStatus: "confirmed",
          createdAt: {
            $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        }).lean(),
      ]);

      const recentAvgPrice =
        recentTrades.length > 0
          ? recentTrades.reduce((sum, t) => sum + t.pricePerKWh, 0) /
            recentTrades.length
          : 0;

      const oldAvgPrice =
        oldTrades.length > 0
          ? oldTrades.reduce((sum, t) => sum + t.pricePerKWh, 0) /
            oldTrades.length
          : 0;

      const priceChange =
        oldAvgPrice > 0
          ? ((recentAvgPrice - oldAvgPrice) / oldAvgPrice) * 100
          : 0;

      const volumeChange =
        oldTrades.length > 0
          ? ((recentTrades.length - oldTrades.length) / oldTrades.length) * 100
          : 0;

      const insights = {
        last7Days: {
          avgPrice: recentAvgPrice,
          totalTrades: recentTrades.length,
          totalEnergy: recentTrades.reduce((sum, t) => sum + t.energyKWh, 0),
        },
        previous7Days: {
          avgPrice: oldAvgPrice,
          totalTrades: oldTrades.length,
          totalEnergy: oldTrades.reduce((sum, t) => sum + t.energyKWh, 0),
        },
        changes: {
          priceChangePercent: priceChange,
          volumeChangePercent: volumeChange,
          trend:
            priceChange > 0
              ? "increasing"
              : priceChange < 0
                ? "decreasing"
                : "stable",
        },
        marketHealth: this.calculateMarketHealth(recentTrades, oldTrades),
      };

      cacheHelper.set(cacheKey, insights, this.CACHE_TTL);
      return insights;
    } catch (error) {
      console.error("❌ Get market insights error:", error);
      throw error;
    }
  }

  /**
   * Calculate market health score (0–100)
   */
  calculateMarketHealth(recentTrades, oldTrades) {
    let score = 50;

    if (recentTrades.length > oldTrades.length) score += 15;
    else if (recentTrades.length < oldTrades.length * 0.5) score -= 15;

    if (recentTrades.length > 0) {
      const prices = recentTrades.map((t) => t.pricePerKWh);
      const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
      const variance =
        prices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) /
        prices.length;
      const coefficient = Math.sqrt(variance) / avgPrice;

      if (coefficient < 0.1) score += 15;
      else if (coefficient > 0.3) score -= 15;
    }

    const uniqueParticipants = new Set();
    recentTrades.forEach((t) => {
      uniqueParticipants.add(t.buyerId.toString());
      uniqueParticipants.add(t.sellerId.toString());
    });

    if (uniqueParticipants.size > 10) score += 10;
    else if (uniqueParticipants.size < 5) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Parse days from time range
   */
  parseDaysFromRange(range) {
    const match = range.match(/(\d+)([dmy])/);
    if (!match) return 30;

    const [, num, unit] = match;
    const value = parseInt(num);

    switch (unit) {
      case "d":
        return value;
      case "m":
        return value * 30;
      case "y":
        return value * 365;
      default:
        return 30;
    }
  }

  /**
   * Invalidate analytics caches
   */
  invalidateCaches() {
    cacheHelper.invalidatePattern("^analytics:");
    console.log("✅ Analytics caches invalidated");
  }
}

export default new P2PAnalyticsService();
