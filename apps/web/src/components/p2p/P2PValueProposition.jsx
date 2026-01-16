import React from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";

const P2PValueProposition = () => {
  const values = [
    {
      icon: "MapPin",
      title: "Local Energy, Not Wasted",
      description:
        "Surplus solar or battery storage stays in your neighborhood instead of being sold back to the grid at low rates. Keep energy local, reduce transmission losses.",
      gradient: "from-green-500 to-emerald-600",
    },
    {
      icon: "DollarSign",
      title: "Fair Community Pricing",
      description:
        "Market-driven prices set by the community, not utility monopolies. Transparent fees, no hidden markups. Buyers and sellers both benefit.",
      gradient: "from-blue-500 to-cyan-600",
    },
    {
      icon: "Shield",
      title: "Verifiable Settlement",
      description:
        "Every trade is recorded with cryptographic proof. Auditable transactions, dispute resolution, and future-ready blockchain integration for maximum trust.",
      gradient: "from-purple-500 to-pink-600",
    },
  ];

  return (
    <div id="how-it-works">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Why Community Energy Trading?
        </h2>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
          A new model for energy exchange that benefits everyone in the
          community
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {values.map((value, index) => {
          const Icon = Icons[value.icon];
          return (
            <motion.div
              key={value.title}
              className="p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-lg hover:shadow-2xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${value.gradient} flex items-center justify-center mb-6 shadow-lg`}
              >
                <Icon className="text-white" size={32} />
              </div>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                {value.title}
              </h3>

              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {value.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default P2PValueProposition;
