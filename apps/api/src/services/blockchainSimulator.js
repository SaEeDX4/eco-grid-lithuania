import crypto from "crypto";

/**
 * Simulated blockchain for demo purposes
 * Generates deterministic transaction hashes and block numbers
 */
class BlockchainSimulator {
  constructor() {
    // Start block number (simulates network history)
    this.currentBlockNumber = 1450000;
  }

  /**
   * Generate deterministic transaction hash
   */
  generateTxHash(tradeData) {
    const txString = JSON.stringify({
      from: tradeData.sellerId,
      to: tradeData.buyerId,
      energy: tradeData.energyKWh,
      price: tradeData.pricePerKWh,
      timestamp: Date.now(),
    });

    return "0x" + crypto.createHash("sha256").update(txString).digest("hex");
  }

  /**
   * Get next block number
   */
  getNextBlockNumber() {
    this.currentBlockNumber += 1;
    return this.currentBlockNumber;
  }

  /**
   * Simulate blockchain settlement
   */
  async settleTrade(tradeData) {
    // Simulate network delay (50-200ms)
    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * 150 + 50)
    );

    const txHash = this.generateTxHash(tradeData);
    const blockNumber = this.getNextBlockNumber();

    const receipt = {
      txHash,
      blockNumber,
      network: "EcoGrid-Testnet",
      gasUsed: "21000",
      status: "confirmed",
      timestamp: new Date().toISOString(),
      confirmations: 1,
    };

    console.log(
      `✅ Blockchain settlement simulated: ${txHash.slice(0, 10)}...`
    );

    return receipt;
  }

  /**
   * Generate full blockchain receipt for display
   */
  generateFullReceipt(trade) {
    return {
      // Transaction details
      txHash: trade.txHash,
      blockNumber: trade.blockNumber,
      network: trade.network,
      gasUsed: trade.gasUsed,
      timestamp: trade.createdAt,

      // Parties
      seller: {
        id: trade.sellerId,
        name: trade.sellerName,
      },
      buyer: {
        id: trade.buyerId,
        name: trade.buyerName,
      },

      // Energy details
      energy: {
        kWh: trade.energyKWh,
        pricePerKWh: trade.pricePerKWh,
      },

      // Payment breakdown
      payment: {
        subtotal: trade.subtotalCAD,
        platformFee: trade.platformFeeCAD,
        blockchainFee: trade.blockchainFeeCAD,
        total: trade.totalCAD,
        sellerReceives: trade.sellerReceivesCAD,
        buyerPays: trade.buyerPaysCAD,
      },

      // Settlement
      settlement: {
        status: trade.settlementStatus,
        confirmations: 1,
      },

      // Impact
      impact: {
        co2SavedKg: trade.co2SavedKg,
      },
    };
  }
}

export default new BlockchainSimulator();
