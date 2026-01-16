import p2pOfferService from "../services/p2pOfferService.js";
import p2pTradeService from "../services/p2pTradeService.js";
import p2pWalletService from "../services/p2pWalletService.js";
import p2pImpactService from "../services/p2pImpactService.js";
import p2pCommunityService from "../services/p2pCommunityService.js";
import p2pLeaderboardService from "../services/p2pLeaderboardService.js";
import p2pAnalyticsService from "../services/p2pAnalyticsService.js";
import p2pConfig from "../config/p2pConfig.js";

class P2PController {
  /* ===================== HEALTH ===================== */

  async health(req, res) {
    try {
      const status = {
        status: "healthy",
        enabled: p2pConfig.enableP2P,
        timestamp: new Date().toISOString(),
        config: {
          energyRange: `${p2pConfig.minEnergyKWh}-${p2pConfig.maxEnergyKWh} kWh`,
          priceRange: `$${p2pConfig.minPricePerKWh}-${p2pConfig.maxPricePerKWh}/kWh`,
          supportedRegions: p2pConfig.supportedRegions,
          features: {
            offers: true,
            autoMatching: p2pConfig.enableAutoMatching,
            blockchainSettlement: p2pConfig.enableBlockchainSettlement,
          },
        },
      };

      res.json({ success: true, data: status });
    } catch (error) {
      console.error("❌ P2P health check error:", error);
      res.status(500).json({
        success: false,
        message: "Health check failed",
        error: error.message,
      });
    }
  }

  /* ===================== OFFERS ===================== */

  async createOffer(req, res) {
    try {
      if (!p2pConfig.enableP2P) {
        return res.status(503).json({
          success: false,
          message: "P2P marketplace is currently disabled",
        });
      }

      const offer = await p2pOfferService.createOffer(
        req.user.id,
        req.user.name || req.user.email,
        req.body
      );

      res.status(201).json({
        success: true,
        message: "Offer created successfully",
        offer,
      });
    } catch (error) {
      console.error("❌ Create offer error:", error);
      res.status(400).json({
        success: false,
        message: "Failed to create offer",
        error: error.message,
      });
    }
  }

  async listOffers(req, res) {
    try {
      const filters = {
        type: req.query.type,
        region: req.query.region,
        status: req.query.status,
        minPrice: req.query.minPrice
          ? parseFloat(req.query.minPrice)
          : undefined,
        maxPrice: req.query.maxPrice
          ? parseFloat(req.query.maxPrice)
          : undefined,
        source: req.query.source,
        excludeOwnerId:
          req.query.excludeOwn === "true" ? req.user?.id : undefined,
      };

      const pagination = {
        page: req.query.page ? parseInt(req.query.page) : 1,
        limit: req.query.limit
          ? parseInt(req.query.limit)
          : p2pConfig.offersPerPage,
        sortBy: req.query.sortBy || "createdAt",
        sortOrder: req.query.sortOrder || "desc",
      };

      const result = await p2pOfferService.listOffers(filters, pagination);
      res.json({ success: true, ...result });
    } catch (error) {
      console.error("❌ List offers error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to list offers",
        error: error.message,
      });
    }
  }

  async getOffer(req, res) {
    try {
      const offer = await p2pOfferService.getOfferById(req.params.offerId);
      p2pOfferService.incrementViewCount(req.params.offerId);
      res.json({ success: true, offer });
    } catch (error) {
      console.error("❌ Get offer error:", error);
      res.status(404).json({
        success: false,
        message: "Offer not found",
        error: error.message,
      });
    }
  }

  async cancelOffer(req, res) {
    try {
      const offer = await p2pOfferService.cancelOffer(
        req.params.offerId,
        req.user.id
      );

      res.json({
        success: true,
        message: "Offer cancelled successfully",
        offer,
      });
    } catch (error) {
      console.error("❌ Cancel offer error:", error);
      res.status(error.message.includes("Unauthorized") ? 403 : 400).json({
        success: false,
        message: "Failed to cancel offer",
        error: error.message,
      });
    }
  }

  async getMyOffers(req, res) {
    try {
      const offers = await p2pOfferService.getUserOffers(req.user.id, {
        status: req.query.status,
      });

      res.json({ success: true, offers, count: offers.length });
    } catch (error) {
      console.error("❌ Get my offers error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve offers",
        error: error.message,
      });
    }
  }

  /* ===================== TRADES ===================== */

  async executeTrade(req, res) {
    try {
      const trade = await p2pTradeService.executeTrade(
        req.user.id,
        req.user.name || req.user.email,
        req.body
      );

      res.status(201).json({
        success: true,
        message: "Trade executed successfully",
        trade,
      });
    } catch (error) {
      console.error("❌ Execute trade error:", error);
      res.status(400).json({
        success: false,
        message: "Failed to execute trade",
        error: error.message,
      });
    }
  }

  async getMyTrades(req, res) {
    const trades = await p2pTradeService.getUserTrades(req.user.id, {
      role: req.query.role,
      limit: req.query.limit ? parseInt(req.query.limit) : 100,
    });

    res.json({ success: true, trades, count: trades.length });
  }

  async getTradeStats(req, res) {
    const stats = await p2pTradeService.getTradeStats(req.user.id);
    res.json({ success: true, stats });
  }

  async getTradeReceipt(req, res) {
    const receipt = await p2pTradeService.getTradeReceipt(req.params.tradeId);
    res.json({ success: true, receipt });
  }

  /* ===================== WALLET ===================== */

  async getWallet(req, res) {
    const wallet = await p2pWalletService.getOrCreateWallet(req.user.id);
    res.json({ success: true, wallet });
  }

  async getWalletStats(req, res) {
    const stats = await p2pWalletService.getWalletStats(req.user.id);
    res.json({ success: true, stats });
  }

  async addFunds(req, res) {
    const wallet = await p2pWalletService.addFunds(
      req.user.id,
      req.body.amount
    );
    res.json({ success: true, wallet });
  }

  async withdrawFunds(req, res) {
    const wallet = await p2pWalletService.withdrawFunds(
      req.user.id,
      req.body.amount
    );
    res.json({ success: true, wallet });
  }

  /* ===================== IMPACT ===================== */

  async getPersonalImpact(req, res) {
    const trades = await p2pTradeService.getUserTrades(req.user.id);
    const impact = p2pImpactService.aggregateImpact(trades);

    res.json({
      success: true,
      impact: { ...impact, totalTrades: trades.length },
    });
  }

  /* ===================== COMMUNITY ===================== */

  async getCommunityImpact(req, res) {
    const impact = await p2pCommunityService.getCommunityImpact();
    res.json({ success: true, impact });
  }

  async getRegionalBreakdown(req, res) {
    const regions = await p2pCommunityService.getRegionalBreakdown();
    res.json({ success: true, regions });
  }

  async getMarketStatistics(req, res) {
    const stats = await p2pCommunityService.getMarketStats();
    res.json({ success: true, stats });
  }

  async getActivityFeed(req, res) {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const activities = await p2pCommunityService.getActivityFeed(limit);

    res.json({
      success: true,
      activities,
      count: activities.length,
    });
  }

  /* ===================== LEADERBOARD ===================== */

  async getLeaderboard(req, res) {
    const type = req.query.type || "energy";
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    let leaderboard;
    switch (type) {
      case "energy":
        leaderboard = await p2pLeaderboardService.getTopTradersByEnergy(limit);
        break;
      case "impact":
        leaderboard = await p2pLeaderboardService.getTopTradersByImpact(limit);
        break;
      case "sellers":
        leaderboard = await p2pLeaderboardService.getTopSellers(limit);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid leaderboard type",
        });
    }

    res.json({ success: true, type, leaderboard });
  }

  async getUserRank(req, res) {
    const rank = await p2pLeaderboardService.getUserRank(req.user.id);
    res.json({ success: true, rank });
  }

  /* ===================== ANALYTICS ===================== */

  async getPriceTrends(req, res) {
    const trends = await p2pAnalyticsService.getPriceTrends(
      req.query.timeRange || "30d"
    );
    res.json({ success: true, trends });
  }

  async getVolumeTrends(req, res) {
    const trends = await p2pAnalyticsService.getVolumeTrends(
      req.query.timeRange || "30d"
    );
    res.json({ success: true, trends });
  }

  async getMarketInsights(req, res) {
    const insights = await p2pAnalyticsService.getMarketInsights();
    res.json({ success: true, insights });
  }
}

export default new P2PController();
