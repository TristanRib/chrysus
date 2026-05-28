export type Asset = {
  ticker: string;
  name: string;
  symbol: string;
  apiPath: string;
};

export type Category = "Matières premières" | "Monnaies" | "Cryptomonnaies";

export const ASSETS: Record<Category, Asset[]> = {
  "Matières premières": [
    { ticker: "GC=F",  name: "Or",           symbol: "XAU",     apiPath: "/commodities/gold"   },
    { ticker: "SI=F",  name: "Argent",        symbol: "XAG",     apiPath: "/commodities/silver" },
    { ticker: "CL=F",  name: "Pétrole WTI",  symbol: "WTI",     apiPath: "/commodities/oil"    },
    { ticker: "NG=F",  name: "Gaz naturel",  symbol: "NG",      apiPath: "/commodities/gas"    },
    { ticker: "HG=F",  name: "Cuivre",        symbol: "Cu",      apiPath: "/commodities/copper" },
    { ticker: "ZW=F",  name: "Blé",           symbol: "ZW",      apiPath: "/commodities/wheat"  },
  ],
  "Monnaies": [
    { ticker: "EURUSD=X", name: "Euro / Dollar",         symbol: "EUR/USD", apiPath: "/forex/eurusd" },
    { ticker: "GBPUSD=X", name: "Livre / Dollar",        symbol: "GBP/USD", apiPath: "/forex/gbpusd" },
    { ticker: "USDJPY=X", name: "Dollar / Yen",          symbol: "USD/JPY", apiPath: "/forex/usdjpy" },
    { ticker: "USDCHF=X", name: "Dollar / Franc suisse", symbol: "USD/CHF", apiPath: "/forex/usdchf" },
    { ticker: "AUDUSD=X", name: "Dollar australien",     symbol: "AUD/USD", apiPath: "/forex/audusd" },
    { ticker: "USDCAD=X", name: "Dollar canadien",       symbol: "USD/CAD", apiPath: "/forex/usdcad" },
  ],
  "Cryptomonnaies": [
    { ticker: "BTC-USD", name: "Bitcoin",  symbol: "BTC", apiPath: "/crypto/bitcoin"  },
    { ticker: "ETH-USD", name: "Ethereum", symbol: "ETH", apiPath: "/crypto/ethereum" },
    { ticker: "SOL-USD", name: "Solana",   symbol: "SOL", apiPath: "/crypto/solana"   },
    { ticker: "BNB-USD", name: "BNB",      symbol: "BNB", apiPath: "/crypto/bnb"      },
    { ticker: "XRP-USD", name: "Ripple",   symbol: "XRP", apiPath: "/crypto/ripple"   },
    { ticker: "ADA-USD", name: "Cardano",  symbol: "ADA", apiPath: "/crypto/cardano"  },
  ],
};

export const CATEGORIES = Object.keys(ASSETS) as Category[];

export function findAsset(ticker: string): (Asset & { category: Category }) | null {
  for (const [category, assets] of Object.entries(ASSETS) as [Category, Asset[]][]) {
    const found = assets.find((a) => a.ticker === ticker);
    if (found) return { ...found, category };
  }
  return null;
}
