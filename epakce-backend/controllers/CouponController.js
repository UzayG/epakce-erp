const db = require('../db');

class CouponController {
  static index(req, res) {
    const coupons = db.prepare('SELECT * FROM coupons ORDER BY id ASC').all();
    return res.status(200).json({ data: coupons });
  }

  static categories(req, res) {
    const cats = db.prepare('SELECT * FROM categories ORDER BY popular_count DESC').all();
    return res.status(200).json({ data: cats });
  }
}

class CalculatorController {
  static calculate(req, res) {
    const { game = 'val', needed_amount = 0 } = req.query;

    const gamePacks = {
      val: [
        { title: 'Valorant 475 VP', amount: 475, price: 95.0, unit_price: 95.0 / 475 },
        { title: 'Valorant 1000 VP', amount: 1000, price: 190.0, unit_price: 190.0 / 1000 },
        { title: 'Valorant 2050 VP', amount: 2050, price: 370.0, unit_price: 370.0 / 2050 },
        { title: 'Valorant 2850 VP', amount: 2850, price: 484.9, unit_price: 484.9 / 2850 },
        { title: 'Valorant 5350 VP', amount: 5350, price: 890.0, unit_price: 890.0 / 5350 },
        { title: 'Valorant 7400 VP', amount: 7400, price: 1215.0, unit_price: 1215.0 / 7400 }
      ],
      pubg: [
        { title: 'PUBG 60 UC', amount: 60, price: 37.0, unit_price: 37.0 / 60 },
        { title: 'PUBG 325 UC', amount: 325, price: 175.0, unit_price: 175.0 / 325 },
        { title: 'PUBG 660 UC', amount: 660, price: 339.0, unit_price: 339.0 / 660 },
        { title: 'PUBG 1800 UC', amount: 1800, price: 899.0, unit_price: 899.0 / 1800 }
      ],
      lol: [
        { title: 'LoL 575 RP', amount: 575, price: 110.0, unit_price: 110.0 / 575 },
        { title: 'LoL 1380 RP', amount: 1380, price: 245.0, unit_price: 245.0 / 1380 },
        { title: 'LoL 1850 RP', amount: 1850, price: 315.0, unit_price: 315.0 / 1850 },
        { title: 'LoL 6500 RP', amount: 6500, price: 990.0, unit_price: 990.0 / 6500 }
      ]
    };

    const packs = gamePacks[game] || gamePacks.val;
    const bestPack = [...packs].sort((a, b) => a.unit_price - b.unit_price)[0];
    const worstPack = [...packs].sort((a, b) => b.unit_price - a.unit_price)[0];

    const amount = Number(needed_amount);
    let estimate = null;

    if (amount > 0) {
      const bestCost = amount * bestPack.unit_price;
      const worstCost = amount * worstPack.unit_price;
      estimate = {
        needed_amount: amount,
        estimated_best_cost: Number(bestCost.toFixed(2)),
        small_pack_cost: Number(worstCost.toFixed(2)),
        estimated_savings: Number((worstCost - bestCost).toFixed(2))
      };
    }

    return res.status(200).json({
      game: game,
      best_value_pack: bestPack,
      packs: packs,
      estimate: estimate
    });
  }
}

module.exports = {
  CouponController,
  CalculatorController
};
