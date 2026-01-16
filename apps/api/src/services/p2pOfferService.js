import P2POffer from "../models/P2POffer.js";
import p2pConfig from "../config/p2pConfig.js";
import { calculateExpiryDate } from "../utils/p2pHelpers.js";

class P2POfferService {
  /**
   * Create a new offer
   */
  async createOffer(userId, userName, offerData) {
    try {
      // Calculate expiry
      const expiresAt = calculateExpiryDate(offerData.ttlDays);

      // Create offer
      const offer = new P2POffer({
        type: offerData.type,
        ownerId: userId,
        ownerName: userName,
        energyKWh: offerData.energyKWh,
        pricePerKWh: offerData.pricePerKWh,
        region: offerData.region,
        city: offerData.city,
        postalCode: offerData.postalCode,
        title: offerData.title,
        description: offerData.description,
        source: offerData.source,
        preferences: offerData.preferences || {},
        expiresAt,
      });

      await offer.save();

      console.log(
        `✅ Created P2P offer: ${offer._id} (${offer.type}, ${offer.energyKWh} kWh)`
      );

      return offer;
    } catch (error) {
      console.error("❌ Create offer error:", error);
      throw error;
    }
  }

  /**
   * Get offers with filters and pagination
   */
  async listOffers(filters = {}, pagination = {}) {
    try {
      const {
        type,
        region,
        status = "open",
        minPrice,
        maxPrice,
        source,
        excludeOwnerId,
      } = filters;

      const {
        page = 1,
        limit = p2pConfig.offersPerPage,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = pagination;

      // Build query
      const query = {};

      if (type) query.type = type;
      if (region) query.region = region;
      if (status) {
        if (Array.isArray(status)) {
          query.status = { $in: status };
        } else {
          query.status = status;
        }
      }
      if (minPrice !== undefined || maxPrice !== undefined) {
        query.pricePerKWh = {};
        if (minPrice !== undefined) query.pricePerKWh.$gte = minPrice;
        if (maxPrice !== undefined) query.pricePerKWh.$lte = maxPrice;
      }
      if (source) query.source = source;
      if (excludeOwnerId) query.ownerId = { $ne: excludeOwnerId };

      // Execute query
      const skip = (page - 1) * limit;
      const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

      const [offers, total] = await Promise.all([
        P2POffer.find(query).sort(sortOptions).skip(skip).limit(limit).lean(),
        P2POffer.countDocuments(query),
      ]);

      return {
        offers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("❌ List offers error:", error);
      throw error;
    }
  }

  /**
   * Get single offer by ID
   */
  async getOfferById(offerId) {
    try {
      const offer = await P2POffer.findById(offerId).lean();

      if (!offer) {
        throw new Error("Offer not found");
      }

      return offer;
    } catch (error) {
      console.error("❌ Get offer error:", error);
      throw error;
    }
  }

  /**
   * Cancel an offer
   */
  async cancelOffer(offerId, userId) {
    try {
      const offer = await P2POffer.findById(offerId);

      if (!offer) {
        throw new Error("Offer not found");
      }

      // Verify ownership
      if (offer.ownerId.toString() !== userId.toString()) {
        throw new Error("Unauthorized: You can only cancel your own offers");
      }

      // Check if can be cancelled
      if (!["open", "partial"].includes(offer.status)) {
        throw new Error(`Cannot cancel offer with status: ${offer.status}`);
      }

      offer.status = "cancelled";
      await offer.save();

      console.log(`✅ Cancelled P2P offer: ${offerId}`);

      return offer;
    } catch (error) {
      console.error("❌ Cancel offer error:", error);
      throw error;
    }
  }

  /**
   * Increment view count
   */
  async incrementViewCount(offerId) {
    try {
      await P2POffer.findByIdAndUpdate(offerId, { $inc: { viewCount: 1 } });
    } catch (error) {
      console.error("❌ Increment view count error:", error);
      // Non-critical
    }
  }

  /**
   * Get user's offers
   */
  async getUserOffers(userId, filters = {}) {
    try {
      const query = { ownerId: userId };

      if (filters.status) {
        query.status = filters.status;
      }

      const offers = await P2POffer.find(query).sort({ createdAt: -1 }).lean();

      return offers;
    } catch (error) {
      console.error("❌ Get user offers error:", error);
      throw error;
    }
  }
}

export default new P2POfferService();
