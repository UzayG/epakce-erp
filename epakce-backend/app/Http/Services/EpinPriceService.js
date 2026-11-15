// ============================================================================
// Epakçe İş Mantığı: EpinPriceService
// Fiyat karşılaştırma ve paket birim maliyet analiz iş kurallarını yönetir.
// ============================================================================

class EpinPriceService {
  // Paket birim maliyet hesaplayıcısı (Akakçe Birim Fiyat Analizi)
  static calculatePackEfficiency(game = 'val', neededAmount = 0) {
    const packsByGame = {
      lol: [
        { title: 'LoL 575 RP', amount: 575, price: 104.90, unit_price: 104.90 / 575 },
        { title: 'LoL 1380 RP', amount: 1380, price: 239.00, unit_price: 239.00 / 1380 },
        { title: 'LoL 1850 RP', amount: 1850, price: 315.00, unit_price: 315.00 / 1850 },
        { title: 'LoL 2800 RP', amount: 2800, price: 459.00, unit_price: 459.00 / 2800 },
        { title: 'LoL 6500 RP', amount: 6500, price: 989.00, unit_price: 989.00 / 6500 },
        { title: 'LoL 10500 RP', amount: 10500, price: 1540.00, unit_price: 1540.00 / 10500 }
      ],
      val: [
        { title: 'Valorant 475 VP', amount: 475, price: 94.50, unit_price: 94.50 / 475 },
        { title: 'Valorant 1000 VP', amount: 1000, price: 189.00, unit_price: 189.00 / 1000 },
        { title: 'Valorant 2050 VP', amount: 2050, price: 369.00, unit_price: 369.00 / 2050 },
        { title: 'Valorant 2850 VP', amount: 2850, price: 484.90, unit_price: 484.90 / 2850 },
        { title: 'Valorant 5350 VP', amount: 5350, price: 885.00, unit_price: 885.00 / 5350 },
        { title: 'Valorant 7400 VP', amount: 7400, price: 1215.00, unit_price: 1215.00 / 7400 },
        { title: 'Valorant 11000 VP', amount: 11000, price: 1749.00, unit_price: 1749.00 / 11000 }
      ],
      pubg: [
        { title: 'PUBG 60 UC', amount: 60, price: 36.50, unit_price: 36.50 / 60 },
        { title: 'PUBG 325 UC', amount: 325, price: 172.00, unit_price: 172.00 / 325 },
        { title: 'PUBG 660 UC', amount: 660, price: 339.00, unit_price: 339.00 / 660 },
        { title: 'PUBG 1800 UC', amount: 1800, price: 889.00, unit_price: 889.00 / 1800 },
        { title: 'PUBG 3850 UC', amount: 3850, price: 1820.00, unit_price: 1820.00 / 3850 },
        { title: 'PUBG 8100 UC', amount: 8100, price: 3590.00, unit_price: 3590.00 / 8100 }
      ],
      roblox: [
        { title: 'Roblox 400 Robux', amount: 400, price: 184.00, unit_price: 184.00 / 400 },
        { title: 'Roblox 800 Robux', amount: 800, price: 345.00, unit_price: 345.00 / 800 },
        { title: 'Roblox 1700 Robux', amount: 1700, price: 699.00, unit_price: 699.00 / 1700 }
      ],
      fc25: [
        { title: 'FC 25 500 Points', amount: 500, price: 185.00, unit_price: 185.00 / 500 },
        { title: 'FC 25 1050 Points', amount: 1050, price: 369.00, unit_price: 369.00 / 1050 },
        { title: 'FC 25 2800 Points', amount: 2800, price: 899.00, unit_price: 899.00 / 2800 }
      ]
    };

    const packs = packsByGame[game] || packsByGame.lol;
    const bestPack = [...packs].sort((a, b) => a.unit_price - b.unit_price)[0];
    const worstPack = [...packs].sort((a, b) => b.unit_price - a.unit_price)[0];

    const amount = Number(neededAmount) || 0;
    let savingsReport = null;

    if (amount > 0) {
      const bestCost = amount * bestPack.unit_price;
      const smallPackCost = amount * worstPack.unit_price;
      savingsReport = {
        needed_amount: amount,
        best_cost: Number(bestCost.toFixed(2)),
        small_pack_cost: Number(smallPackCost.toFixed(2)),
        savings_tl: Number((smallPackCost - bestCost).toFixed(2))
      };
    }

    return {
      game,
      best_value_pack: bestPack,
      packs,
      savings_report: savingsReport
    };
  }
}

module.exports = EpinPriceService;
