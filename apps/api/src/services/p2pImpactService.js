/**
 * Calculate environmental impact of P2P trades
 */
class P2PImpactService {
  constructor() {
    // CO2 savings per kWh (kg)
    // Assumption: Grid energy has ~0.5 kg CO2/kWh
    // P2P renewable energy saves this amount
    this.CO2_PER_KWH_KG = 0.5;

    // Conversion factors
    this.TREES_PER_KG_CO2 = 0.05; // 1 tree absorbs ~20kg CO2/year
    this.EV_KM_PER_KWH = 5; // Average EV efficiency
  }

  /**
   * Calculate CO2 saved for a trade
   */
  calculateCO2Saved(energyKWh, source = null) {
    // If source is renewable, full savings
    // If source is unknown/grid, partial savings (grid peer-to-peer reduces transmission loss)
    const savingsFactor = ["solar", "wind", "battery"].includes(source)
      ? 1.0
      : 0.3;

    return energyKWh * this.CO2_PER_KWH_KG * savingsFactor;
  }

  /**
   * Calculate trees equivalent
   */
  calculateTreesEquivalent(co2SavedKg) {
    return Math.floor(co2SavedKg * this.TREES_PER_KG_CO2);
  }

  /**
   * Calculate EV kilometers equivalent
   */
  calculateEVKilometers(energyKWh) {
    return Math.floor(energyKWh * this.EV_KM_PER_KWH);
  }

  /**
   * Calculate home-days powered
   */
  calculateHomeDaysPowered(energyKWh) {
    // Average home uses ~30 kWh/day
    return Math.floor(energyKWh / 30);
  }

  /**
   * Get complete impact metrics for a trade
   */
  getTradeImpact(trade) {
    return {
      co2SavedKg: trade.co2SavedKg,
      treesEquivalent: this.calculateTreesEquivalent(trade.co2SavedKg),
      evKilometers: this.calculateEVKilometers(trade.energyKWh),
      homeDaysPowered: this.calculateHomeDaysPowered(trade.energyKWh),
    };
  }

  /**
   * Aggregate impact for multiple trades
   */
  aggregateImpact(trades) {
    const totalEnergy = trades.reduce((sum, t) => sum + t.energyKWh, 0);
    const totalCO2 = trades.reduce((sum, t) => sum + t.co2SavedKg, 0);

    return {
      totalEnergyKWh: totalEnergy,
      totalCO2SavedKg: totalCO2,
      treesEquivalent: this.calculateTreesEquivalent(totalCO2),
      evKilometers: this.calculateEVKilometers(totalEnergy),
      homeDaysPowered: this.calculateHomeDaysPowered(totalEnergy),
    };
  }
}

export default new P2PImpactService();
