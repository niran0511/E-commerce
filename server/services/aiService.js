const config = require('../config/config');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');

const hasGroqKey = config.groqApiKey && config.groqApiKey !== 'your_groq_api_key_here';

// ─── Intent Detection ───────────────────────────────────────────────────────────

const INTENTS = {
  PRODUCT_SEARCH: 'product_search',
  PRODUCT_COMPARE: 'product_compare',
  ORDER_TRACKING: 'order_tracking',
  FAQ: 'faq',
  RECOMMENDATION: 'recommendation',
  GENERAL: 'general',
};

function detectIntent(message) {
  const msg = message.toLowerCase();

  // 1. Order tracking (Highest priority for specific intents)
  if (/\b(order|track|where is|status|delivery|shipped|deliver)\b/.test(msg)) {
    return INTENTS.ORDER_TRACKING;
  }

  // 2. FAQ
  if (
    /\b(return|refund|shipping|warranty|policy|how to|exchange|cancel|payment|cod|upi)\b/.test(
      msg
    )
  ) {
    return INTENTS.FAQ;
  }

  // 3. Recommendations
  if (
    /\b(recommend|suggest|best|popular|trending|top rated|good|what should)\b/.test(
      msg
    )
  ) {
    return INTENTS.RECOMMENDATION;
  }

  // 4. Product comparison
  if (/\b(compare|vs|versus|difference|better|which one)\b/.test(msg)) {
    return INTENTS.PRODUCT_COMPARE;
  }

  // 5. Product search (Fallback for generic shopping words like "want", "need")
  if (
    /\b(show|find|search|need|want|looking|under|below|above|between)\b/.test(msg) ||
    /₹\s?\d+|rs\.?\s?\d+|\d+\s?rupees?/i.test(msg) ||
    /\b(phone|laptop|shirt|shoe|watch|headphone|earbuds|camera|tv|book)\b/i.test(msg)
  ) {
    return INTENTS.PRODUCT_SEARCH;
  }

  return INTENTS.GENERAL;
}

// ─── Data Fetchers ──────────────────────────────────────────────────────────────

async function fetchProductSearchData(message) {
  const filter = {};

  // Try to extract price constraint
  const priceMatch = message.match(
    /(?:under|below|less than|upto|up to|max)\s*(?:₹|rs\.?\s?)(\d+)/i
  );
  if (priceMatch) {
    filter.price = { $lte: parseInt(priceMatch[1], 10) };
  }

  const aboveMatch = message.match(
    /(?:above|over|more than|min|starting)\s*(?:₹|rs\.?\s?)(\d+)/i
  );
  if (aboveMatch) {
    filter.price = { ...filter.price, $gte: parseInt(aboveMatch[1], 10) };
  }

  // Search by keywords in product name
  const stopWords = new Set([
    'show', 'me', 'find', 'search', 'for', 'i', 'need', 'want', 'looking',
    'a', 'the', 'some', 'any', 'good', 'best', 'under', 'below', 'above',
    'please', 'can', 'you', 'get', 'with', 'and', 'or', 'in', 'of', 'to',
  ]);
  const keywords = message
    .toLowerCase()
    .replace(/[₹$,]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w) && !/^\d+$/.test(w));

  if (keywords.length > 0) {
    filter.name = { $regex: keywords.join('|'), $options: 'i' };
  }

  const products = await Product.find(filter)
    .populate('category', 'name')
    .sort({ avgRating: -1, sold: -1 })
    .limit(6)
    .lean();

  return products;
}

async function fetchComparisonData(message) {
  const words = message.split(/\s+/);
  const products = await Product.find({
    name: { $regex: words.filter((w) => w.length > 3).join('|'), $options: 'i' },
  })
    .populate('category', 'name')
    .limit(2)
    .lean();

  return products;
}

async function fetchOrderData(userId) {
  const orders = await Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();
  return orders;
}

async function fetchRecommendations(userId) {
  // Check user's cart and wishlist for categories, then recommend similar
  const cart = await Cart.findOne({ user: userId }).populate('items.product', 'category');
  const wishlist = await Wishlist.findOne({ user: userId }).populate(
    'products.product',
    'category'
  );

  const categoryIds = new Set();

  if (cart) {
    cart.items.forEach((item) => {
      if (item.product && item.product.category) {
        categoryIds.add(item.product.category.toString());
      }
    });
  }
  if (wishlist) {
    wishlist.products.forEach((p) => {
      if (p.product && p.product.category) {
        categoryIds.add(p.product.category.toString());
      }
    });
  }

  let products;
  if (categoryIds.size > 0) {
    products = await Product.find({
      category: { $in: Array.from(categoryIds) },
    })
      .populate('category', 'name')
      .sort({ avgRating: -1, sold: -1 })
      .limit(6)
      .lean();
  } else {
    // Fallback: bestsellers and featured
    products = await Product.find({
      $or: [{ isBestSeller: true }, { isFeatured: true }],
    })
      .populate('category', 'name')
      .sort({ avgRating: -1 })
      .limit(6)
      .lean();
  }

  return products;
}

// ─── FAQ Data ───────────────────────────────────────────────────────────────────

const FAQ_DATA = {
  return:
    'Our return policy allows returns within 7 days of delivery for most products. Items must be in original condition with tags. Electronics have a 7-day replacement guarantee. To initiate a return, go to Orders → Select Order → Request Return.',
  refund:
    'Refunds are processed within 5-7 business days after we receive the returned item. The amount is credited to your original payment method. For COD orders, refund is sent via bank transfer.',
  shipping:
    'We offer free shipping on orders above ₹500. Standard delivery takes 3-5 business days. Express delivery (1-2 days) is available in select cities for ₹99 extra.',
  warranty:
    'Electronics come with a manufacturer warranty (usually 1 year). Fashion and lifestyle items have a 30-day quality guarantee. Warranty claims can be filed through your order details page.',
  policy:
    'We accept COD, Credit/Debit Cards, and UPI payments. All products are 100% genuine. We have a no-questions-asked return policy for most categories within 7 days.',
  cancel:
    'You can cancel an order before it is shipped. Go to Orders → Select Order → Cancel Order. Once shipped, you will need to refuse delivery or initiate a return after delivery.',
  payment:
    'We accept Cash on Delivery (COD), Credit/Debit Cards, and UPI payments. COD is available for orders up to ₹10,000. Card and UPI payments are processed securely.',
  exchange:
    'Exchanges are available within 7 days of delivery for size/color changes. Go to Orders → Select Order → Exchange. The replacement will be shipped after we receive the original item.',
};

// ─── Formatters ─────────────────────────────────────────────────────────────────

function formatProductsForPrompt(products) {
  if (!products || products.length === 0) return 'No products found.';

  return products
    .map(
      (p, i) =>
        `${i + 1}. ${p.name} - ₹${p.price}${p.mrp ? ` (MRP: ₹${p.mrp}, ${p.discount}% off)` : ''} | Rating: ${p.avgRating}/5 (${p.numReviews} reviews) | Brand: ${p.brand || 'N/A'} | Stock: ${p.stock > 0 ? 'In Stock' : 'Out of Stock'}`
    )
    .join('\n');
}

function formatOrdersForPrompt(orders) {
  if (!orders || orders.length === 0) return 'No recent orders found.';

  return orders
    .map(
      (o, i) =>
        `${i + 1}. Order #${o.orderNumber} | Status: ${o.orderStatus} | Total: ₹${o.totalAmount} | Date: ${new Date(o.createdAt).toLocaleDateString('en-IN')} | Items: ${o.items.map((it) => it.name).join(', ')}`
    )
    .join('\n');
}

// ─── Fallback Responses (when API key not configured) ───────────────────────────

function getFallbackResponse(intent, data) {
  switch (intent) {
    case INTENTS.PRODUCT_SEARCH: {
      if (!data || data.length === 0) {
        return "Hmm, I couldn't find exactly what you're looking for right now. 😕 Could you try searching with different keywords or browse our categories?";
      }
      let resp = "I found some great options for you! Here they are:\n\n";
      data.forEach((p, i) => {
        resp += `${i + 1}. **[${p.name}](/products/${p._id})** - ₹${p.price}`;
        if (p.mrp) resp += ` ~~₹${p.mrp}~~ (${p.discount}% off)`;
        resp += ` | ⭐ ${p.avgRating}/5\n`;
      });
      resp += "\nFeel free to click on any product to see more details, or tell me if you want to narrow down the search!";
      return resp;
    }
    case INTENTS.PRODUCT_COMPARE: {
      if (!data || data.length < 2) {
        return "I need at least two specific product names to do a comparison. What would you like me to compare? 🤔";
      }
      let resp = `Here's how **${data[0].name}** compares to **${data[1].name}**:\n\n`;
      resp += `| Feature | ${data[0].name} | ${data[1].name} |\n`;
      resp += `|---------|--------------|---------------|\n`;
      resp += `| Price | ₹${data[0].price} | ₹${data[1].price} |\n`;
      resp += `| Rating | ${data[0].avgRating}/5 | ${data[1].avgRating}/5 |\n`;
      resp += `| Brand | ${data[0].brand || 'N/A'} | ${data[1].brand || 'N/A'} |\n`;
      resp += `\nWhich one are you leaning towards?`;
      return resp;
    }
    case INTENTS.ORDER_TRACKING: {
      if (!data || data.length === 0) {
        return "I don't see any recent orders on your account just yet! Once you place an order, I'll be able to track it for you right here. 📦";
      }
      let resp = "I've pulled up your recent orders! Here is their current status:\n\n";
      data.forEach((o, i) => {
        resp += `${i + 1}. **Order [${o.orderNumber}](/orders)** - Status: **${o.orderStatus}** | Total: ₹${o.totalAmount}\n`;
      });
      resp += `\nYou can click on your order number to view more detailed tracking information on your orders page.`;
      return resp;
    }
    case INTENTS.FAQ: {
      return "I can definitely help with that! Here is some useful information regarding our policies:\n\n" +
        "• **Returns**: We offer a 7-day return window for most products.\n" +
        "• **Refunds**: These are processed within 5-7 business days directly to your original payment method.\n" +
        "• **Shipping**: You get free shipping on all orders above ₹500!\n" +
        "• **Payment**: We accept Cash on Delivery (COD), Cards, and all UPI apps.\n\n" +
        "If you need more specific details, just let me know!";
    }
    case INTENTS.RECOMMENDATION: {
      if (!data || data.length === 0) {
        return "I'd recommend checking out our top featured and bestseller products on the home page! We have some amazing deals going on right now. ✨";
      }
      let resp = "Based on what's popular and your interests, here are my top recommendations for you:\n\n";
      data.forEach((p, i) => {
        resp += `${i + 1}. **[${p.name}](/products/${p._id})** - ₹${p.price} | ⭐ ${p.avgRating}/5\n`;
      });
      resp += "\nDo any of these catch your eye?";
      return resp;
    }
    default:
      return "Hello there! 👋 I'm your friendly ShopSmart AI assistant. I'm here to make your shopping experience amazing.\n\n" +
        "Here are a few things I can do for you:\n" +
        "• 🔍 **Find products** – Just say \"Show me phones under ₹15000\"\n" +
        "• 📊 **Compare items** – Try \"Compare iPhone vs Samsung\"\n" +
        "• 📦 **Track orders** – Simply ask \"Where is my order?\"\n" +
        "• 💡 **Get ideas** – Ask \"Can you suggest some good laptops?\"\n" +
        "• ❓ **Answer questions** – Like \"What is your return policy?\"\n\n" +
        "What can I help you discover today?";
  }
}

// ─── Main Chat Processor ────────────────────────────────────────────────────────

async function processChat(message, userId) {
  try {
    const intent = detectIntent(message);

    // Fetch relevant data based on intent
    let contextData = null;

    switch (intent) {
      case INTENTS.PRODUCT_SEARCH:
        contextData = await fetchProductSearchData(message);
        break;
      case INTENTS.PRODUCT_COMPARE:
        contextData = await fetchComparisonData(message);
        break;
      case INTENTS.ORDER_TRACKING:
        contextData = await fetchOrderData(userId);
        break;
      case INTENTS.RECOMMENDATION:
        contextData = await fetchRecommendations(userId);
        break;
      case INTENTS.FAQ: {
        const msg = message.toLowerCase();
        const faqKeys = Object.keys(FAQ_DATA);
        const matchedKey = faqKeys.find((key) => msg.includes(key));
        contextData = matchedKey ? FAQ_DATA[matchedKey] : Object.values(FAQ_DATA).join('\n\n');
        break;
      }
      default:
        break;
    }

    // If Groq API key is not configured, return fallback
    if (!hasGroqKey) {
      return getFallbackResponse(intent, contextData);
    }

    // Build context prompt
    let contextPrompt = '';

    switch (intent) {
      case INTENTS.PRODUCT_SEARCH:
        contextPrompt = `The user is searching for products. Here are the matching products from our database:\n${formatProductsForPrompt(contextData)}`;
        break;
      case INTENTS.PRODUCT_COMPARE:
        contextPrompt = `The user wants to compare products. Here are the products found:\n${formatProductsForPrompt(contextData)}`;
        break;
      case INTENTS.ORDER_TRACKING:
        contextPrompt = `The user is asking about their orders. Here are their recent orders:\n${formatOrdersForPrompt(contextData)}`;
        break;
      case INTENTS.RECOMMENDATION:
        contextPrompt = `The user wants product recommendations. Here are recommended products based on their activity:\n${formatProductsForPrompt(contextData)}`;
        break;
      case INTENTS.FAQ:
        contextPrompt = `The user has a question. Here is the relevant FAQ information:\n${contextData}`;
        break;
      default:
        contextPrompt = 'The user has a general question about our e-commerce store.';
    }

    const systemInstruction =
      "You are ShopSmart AI, a helpful and knowledgeable shopping assistant for an e-commerce platform. " +
      "Your goal is to help users find products, track orders, and answer questions about store policies. " +
      "IMPORTANT: ALWAYS use Markdown to format your responses. " +
      "When guiding users to pages, use exact Markdown links. Examples: " +
      "- To track an order: 'You can [track your order here](/orders)' " +
      "- To view products: 'Check out our [latest products](/products)' " +
      "- For login: 'Please [login](/login) to continue' " +
      "- For policies: 'View our [Return Policy](/return-policy) or [Shipping Info](/shipping-info)' " +
      "Keep responses concise, friendly, and directly address the user's needs.\n\n" +
      "Database Context:\n" + contextPrompt;

    // Call Groq API natively
    const result = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1024
      })
    });
    
    const data = await result.json();
    if (!result.ok) {
        throw new Error(data.error?.message || 'Groq API error');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('AI Service Error:', error.message);
    // Graceful fallback
    const intent = detectIntent(message);
    try {
      let data = null;
      if (intent === INTENTS.PRODUCT_SEARCH) data = await fetchProductSearchData(message);
      if (intent === INTENTS.ORDER_TRACKING) data = await fetchOrderData(userId);
      if (intent === INTENTS.RECOMMENDATION) data = await fetchRecommendations(userId);
      return getFallbackResponse(intent, data);
    } catch {
      return getFallbackResponse(INTENTS.GENERAL, null);
    }
  }
}

module.exports = { processChat };
