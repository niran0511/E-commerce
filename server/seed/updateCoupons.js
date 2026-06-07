require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Coupon = require('../models/Coupon');

async function fix() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce');
  
  // Update FLAT200 — valid only above ₹1000
  const r1 = await Coupon.findOneAndUpdate(
    { code: 'FLAT200' },
    { minPurchase: 1000, discountValue: 200, discountType: 'flat', maxDiscount: 200 },
    { new: true, upsert: true }
  );
  console.log('FLAT200:', r1?.code, '→ minPurchase:', r1?.minPurchase);

  // Update WELCOME10 — valid above ₹300, 10% off max ₹500
  const r2 = await Coupon.findOneAndUpdate(
    { code: 'WELCOME10' },
    { minPurchase: 300, discountValue: 10, discountType: 'percentage', maxDiscount: 500 },
    { new: true, upsert: true }
  );
  console.log('WELCOME10:', r2?.code, '→ minPurchase:', r2?.minPurchase);

  // Update SUMMER25 — valid above ₹500, 25% off max ₹750
  const r3 = await Coupon.findOneAndUpdate(
    { code: 'SUMMER25' },
    { minPurchase: 500, discountValue: 25, discountType: 'percentage', maxDiscount: 750 },
    { new: true, upsert: true }
  );
  console.log('SUMMER25:', r3?.code, '→ minPurchase:', r3?.minPurchase);

  console.log('\n✅ Coupon conditions updated!');
  await mongoose.disconnect();
}

fix().catch(e => { console.error(e); process.exit(1); });
