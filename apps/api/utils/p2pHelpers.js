const p2pConfig = require("../config/p2pConfig");

/**
 * Calculate offer expiry date
 */
const calculateExpiryDate = (days = null) => {
  const ttlDays = days || p2pConfig.defaultOfferTTLDays;
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + ttlDays);
  return expiryDate;
};

/**
 * Validate energy amount
 */
const validateEnergyAmount = (energyKWh) => {
  if (typeof energyKWh !== "number" || isNaN(energyKWh)) {
    return { valid: false, error: "Energy amount must be a number" };
  }

  if (energyKWh < p2pConfig.minEnergyKWh) {
    return {
      valid: false,
      error: `Energy amount must be at least ${p2pConfig.minEnergyKWh} kWh`,
    };
  }

  if (energyKWh > p2pConfig.maxEnergyKWh) {
    return {
      valid: false,
      error: `Energy amount cannot exceed ${p2pConfig.maxEnergyKWh} kWh`,
    };
  }

  return { valid: true };
};

/**
 * Validate price per kWh
 */
const validatePrice = (pricePerKWh) => {
  if (typeof pricePerKWh !== "number" || isNaN(pricePerKWh)) {
    return { valid: false, error: "Price must be a number" };
  }

  if (pricePerKWh < p2pConfig.minPricePerKWh) {
    return {
      valid: false,
      error: `Price must be at least $${p2pConfig.minPricePerKWh}/kWh`,
    };
  }

  if (pricePerKWh > p2pConfig.maxPricePerKWh) {
    return {
      valid: false,
      error: `Price cannot exceed $${p2pConfig.maxPricePerKWh}/kWh`,
    };
  }

  return { valid: true };
};

/**
 * Validate region
 */
const validateRegion = (region) => {
  if (!region || typeof region !== "string") {
    return { valid: false, error: "Region is required" };
  }

  if (!p2pConfig.supportedRegions.includes(region)) {
    return {
      valid: false,
      error: `Region must be one of: ${p2pConfig.supportedRegions.join(", ")}`,
    };
  }

  return { valid: true };
};

/**
 * Format energy amount for display
 */
const formatEnergy = (kWh) => {
  if (kWh >= 1000) {
    return `${(kWh / 1000).toFixed(2)} MWh`;
  }
  return `${kWh.toFixed(2)} kWh`;
};

/**
 * Format CAD currency
 */
const formatCAD = (amount) => {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(amount);
};

module.exports = {
  calculateExpiryDate,
  validateEnergyAmount,
  validatePrice,
  validateRegion,
  formatEnergy,
  formatCAD,
};
