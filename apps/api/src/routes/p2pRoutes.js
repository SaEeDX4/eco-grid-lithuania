import express from "express";
import p2pController from "../controllers/p2pController.js";
import { authenticate } from "../middleware/auth.js";
import {
  validateCreateOffer,
  validateListOffers,
} from "../middleware/p2pValidation.js";

const router = express.Router();

// ===================== PUBLIC ROUTES =====================

// Health check
router.get("/health", p2pController.health);

// ===== Community / Market / Analytics (PUBLIC – no auth) =====

// Community impact
router.get("/impact/community", p2pController.getCommunityImpact);
router.get("/impact/regions", p2pController.getRegionalBreakdown);

// Market data
router.get("/market/stats", p2pController.getMarketStatistics);
router.get("/market/activity", p2pController.getActivityFeed);

// Leaderboards (public view)
router.get("/leaderboard", p2pController.getLeaderboard);

// Analytics
router.get("/analytics/price-trends", p2pController.getPriceTrends);
router.get("/analytics/volume-trends", p2pController.getVolumeTrends);
router.get("/analytics/insights", p2pController.getMarketInsights);

// ===================== PROTECTED ROUTES =====================
router.use(authenticate);

// ===================== OFFERS =====================
router.get("/offers", validateListOffers, p2pController.listOffers);
router.post("/offers", validateCreateOffer, p2pController.createOffer);
router.get("/offers/my", p2pController.getMyOffers);
router.get("/offers/:offerId", p2pController.getOffer);
router.post("/offers/:offerId/cancel", p2pController.cancelOffer);

// ===================== TRADES =====================
router.post("/trades", p2pController.executeTrade);
router.get("/trades/me", p2pController.getMyTrades);
router.get("/trades/stats", p2pController.getTradeStats);
router.get("/trades/:tradeId/receipt", p2pController.getTradeReceipt);

// ===================== WALLET =====================
router.get("/wallet", p2pController.getWallet);
router.get("/wallet/stats", p2pController.getWalletStats);
router.post("/wallet/add-funds", p2pController.addFunds);
router.post("/wallet/withdraw", p2pController.withdrawFunds);

// ===================== IMPACT =====================
router.get("/impact/personal", p2pController.getPersonalImpact);

// ===================== LEADERBOARD (AUTH) =====================
router.get("/leaderboard/rank", p2pController.getUserRank);

export default router;
