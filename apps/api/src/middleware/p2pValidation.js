import { body, query, validationResult } from "express-validator";
import p2pConfig from "../config/p2pConfig.js";

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  next();
};

/**
 * Validate create offer request
 */
const validateCreateOffer = [
  body("type")
    .isIn(["sell", "buy"])
    .withMessage('Type must be either "sell" or "buy"'),

  body("energyKWh")
    .isFloat({ min: p2pConfig.minEnergyKWh, max: p2pConfig.maxEnergyKWh })
    .withMessage(
      `Energy must be between ${p2pConfig.minEnergyKWh} and ${p2pConfig.maxEnergyKWh} kWh`
    ),

  body("pricePerKWh")
    .isFloat({ min: p2pConfig.minPricePerKWh, max: p2pConfig.maxPricePerKWh })
    .withMessage(
      `Price must be between $${p2pConfig.minPricePerKWh} and $${p2pConfig.maxPricePerKWh} per kWh`
    ),

  body("region")
    .isIn(p2pConfig.supportedRegions)
    .withMessage(
      `Region must be one of: ${p2pConfig.supportedRegions.join(", ")}`
    ),

  body("title")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Title cannot exceed 100 characters"),

  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("source")
    .optional()
    .isIn(["solar", "wind", "battery", "grid", "mixed"])
    .withMessage("Invalid energy source"),

  handleValidationErrors,
];

/**
 * Validate list offers query params
 */
const validateListOffers = [
  query("type")
    .optional()
    .isIn(["sell", "buy"])
    .withMessage('Type must be either "sell" or "buy"'),

  query("region").optional().isString().withMessage("Region must be a string"),

  query("minPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Min price must be a positive number"),

  query("maxPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Max price must be a positive number"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: p2pConfig.maxOffersPerPage })
    .withMessage(`Limit must be between 1 and ${p2pConfig.maxOffersPerPage}`),

  handleValidationErrors,
];

export { validateCreateOffer, validateListOffers, handleValidationErrors };
