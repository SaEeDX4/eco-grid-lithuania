import P2PWallet from "../models/P2PWallet.js";
import cacheHelper from "../utils/cacheHelper.js";

class P2PLeaderboardService {
  constructor() {
    this.CACHE_TTL = 10 * 60 * 1000; // 10 minutes
  }

  /**
   * Get top traders by energy volume
   */
  async getTopTradersByEnergy(limit = 10) {
    const cacheKey = `leaderboard:energy:${limit}`;
    const cached = cacheHelper.get(cacheKey);
    if (cached) return cached;

    try {
      const wallets = await P2PWallet.find()
        .sort({ "stats.totalEnergyBought": -1, "stats.totalEnergySold": -1 })
        .limit(limit)
        .populate("userId", "name email")
        .lean();

      const leaderboard = wallets.map((wallet, index) => ({
        rank: index + 1,
        userId: wallet.userId._id,
        name: wallet.userId.name || wallet.userId.email.split("@")[0],
        totalEnergyKWh:
          wallet.stats.totalEnergyBought + wallet.stats.totalEnergySold,
        totalTrades: wallet.stats.totalTrades,
        totalCO2SavedKg: wallet.stats.totalCO2SavedKg,
      }));

      cacheHelper.set(cacheKey, leaderboard, this.CACHE_TTL);
      return leaderboard;
    } catch (error) {
      console.error("❌ Get energy leaderboard error:", error);
      throw error;
    }
  }

  /**
   * Get top traders by CO₂ impact
   */
  async getTopTradersByImpact(limit = 10) {
    const cacheKey = `leaderboard:impact:${limit}`;
    const cached = cacheHelper.get(cacheKey);
    if (cached) return cached;

    try {
      const wallets = await P2PWallet.find()
        .sort({ "stats.totalCO2SavedKg": -1 })
        .limit(limit)
        .populate("userId", "name email")
        .lean();

      const leaderboard = wallets.map((wallet, index) => ({
        rank: index + 1,
        userId: wallet.userId._id,
        name: wallet.userId.name || wallet.userId.email.split("@")[0],
        totalCO2SavedKg: wallet.stats.totalCO2SavedKg,
        totalEnergyKWh:
          wallet.stats.totalEnergyBought + wallet.stats.totalEnergySold,
        totalTrades: wallet.stats.totalTrades,
      }));

      cacheHelper.set(cacheKey, leaderboard, this.CACHE_TTL);
      return leaderboard;
    } catch (error) {
      console.error("❌ Get impact leaderboard error:", error);
      throw error;
    }
  }

  /**
   * Get top sellers
   */
  async getTopSellers(limit = 10) {
    const cacheKey = `leaderboard:sellers:${limit}`;
    const cached = cacheHelper.get(cacheKey);
    if (cached) return cached;

    try {
      const wallets = await P2PWallet.find()
        .sort({ "stats.totalEnergySold": -1 })
        .limit(limit)
        .populate("userId", "name email")
        .lean();

      const leaderboard = wallets
        .filter((w) => w.stats.totalEnergySold > 0)
        .map((wallet, index) => ({
          rank: index + 1,
          userId: wallet.userId._id,
          name: wallet.userId.name || wallet.userId.email.split("@")[0],
          totalEnergySold: wallet.stats.totalEnergySold,
          totalEarnings: wallet.stats.totalEarnings,
          totalTrades: wallet.stats.totalTrades,
        }));

      cacheHelper.set(cacheKey, leaderboard, this.CACHE_TTL);
      return leaderboard;
    } catch (error) {
      console.error("❌ Get sellers leaderboard error:", error);
      throw error;
    }
  }

  /**
   * Get user's rank
   */
  async getUserRank(userId) {
    try {
      const userWallet = await P2PWallet.findOne({ userId }).lean();

      if (!userWallet) {
        return {
          energyRank: null,
          impactRank: null,
          totalUsers: 0,
        };
      }

      const totalUsers = await P2PWallet.countDocuments();

      const energyRank = await P2PWallet.countDocuments({
        $expr: {
          $gt: [
            { $add: ["$stats.totalEnergyBought", "$stats.totalEnergySold"] },
            userWallet.stats.totalEnergyBought +
              userWallet.stats.totalEnergySold,
          ],
        },
      });

      const impactRank = await P2PWallet.countDocuments({
        "stats.totalCO2SavedKg": { $gt: userWallet.stats.totalCO2SavedKg },
      });

      return {
        energyRank: energyRank + 1,
        impactRank: impactRank + 1,
        totalUsers,
        energyPercentile:
          totalUsers > 0 ? 100 - (energyRank / totalUsers) * 100 : 0,
        impactPercentile:
          totalUsers > 0 ? 100 - (impactRank / totalUsers) * 100 : 0,
      };
    } catch (error) {
      console.error("❌ Get user rank error:", error);
      throw error;
    }
  }

  /**
   * Invalidate leaderboard caches
   */
  invalidateCaches() {
    cacheHelper.invalidatePattern("^leaderboard:");
    console.log("✅ Leaderboard caches invalidated");
  }
}

export default new P2PLeaderboardService();
