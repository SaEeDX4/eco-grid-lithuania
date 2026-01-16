// P2P Configuration
// Environment-driven config for P2P marketplace

const p2pConfig = {
  // Offer constraints
  minEnergyKWh: parseFloat(process.env.P2P_MIN_ENERGY_KWH) || 1,
  maxEnergyKWh: parseFloat(process.env.P2P_MAX_ENERGY_KWH) || 1000,
  minPricePerKWh: parseFloat(process.env.P2P_MIN_PRICE_PER_KWH) || 0.05,
  maxPricePerKWh: parseFloat(process.env.P2P_MAX_PRICE_PER_KWH) || 0.5,

  // Offer expiry
  defaultOfferTTLDays: parseInt(process.env.P2P_DEFAULT_OFFER_TTL_DAYS) || 30,
  maxOfferTTLDays: parseInt(process.env.P2P_MAX_OFFER_TTL_DAYS) || 90,

  // Feature flags
  enableP2P: process.env.P2P_ENABLED === "true" || true,
  enableAutoMatching: process.env.P2P_AUTO_MATCHING === "true" || false, // Phase 2+
  enableBlockchainSettlement:
    process.env.P2P_BLOCKCHAIN_ENABLED === "true" || false, // Phase 3+

  // Regions
  supportedRegions: (
    process.env.P2P_SUPPORTED_REGIONS || "BC,Alberta,Ontario"
  ).split(","),

  // Pagination
  offersPerPage: parseInt(process.env.P2P_OFFERS_PER_PAGE) || 50,
  maxOffersPerPage: parseInt(process.env.P2P_MAX_OFFERS_PER_PAGE) || 100,
};

// Validation
const validateConfig = () => {
  const errors = [];

  if (p2pConfig.minEnergyKWh >= p2pConfig.maxEnergyKWh) {
    errors.push("P2P_MIN_ENERGY_KWH must be less than P2P_MAX_ENERGY_KWH");
  }

  if (p2pConfig.minPricePerKWh >= p2pConfig.maxPricePerKWh) {
    errors.push(
      "P2P_MIN_PRICE_PER_KWH must be less than P2P_MAX_PRICE_PER_KWH"
    );
  }

  if (p2pConfig.defaultOfferTTLDays > p2pConfig.maxOfferTTLDays) {
    errors.push(
      "P2P_DEFAULT_OFFER_TTL_DAYS cannot exceed P2P_MAX_OFFER_TTL_DAYS"
    );
  }

  if (errors.length > 0) {
    throw new Error(`P2P Configuration errors:\n${errors.join("\n")}`);
  }

  console.log("✅ P2P Configuration validated successfully");
};

// Run validation
try {
  validateConfig();
} catch (error) {
  console.error("❌ P2P Configuration validation failed:", error.message);
  process.exit(1);
}

export default p2pConfig;
