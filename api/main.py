import os
import time
import requests
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from groq import Groq
import yfinance as yf

load_dotenv(Path(__file__).parent.parent / ".env")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

VALID_PERIODS = {"1d", "5d", "1mo", "3mo", "6mo", "1y"}

COMMODITIES: dict[str, str] = {
    "gold":   "GC=F",
    "silver": "SI=F",
    "oil":    "CL=F",
    "gas":    "NG=F",
    "copper": "HG=F",
    "wheat":  "ZW=F",
}

FOREX: dict[str, str] = {
    "eurusd": "EURUSD=X",
    "gbpusd": "GBPUSD=X",
    "usdjpy": "USDJPY=X",
    "usdchf": "USDCHF=X",
    "audusd": "AUDUSD=X",
    "usdcad": "USDCAD=X",
}

CRYPTO: dict[str, str] = {
    "bitcoin":  "BTC-USD",
    "ethereum": "ETH-USD",
    "solana":   "SOL-USD",
    "bnb":      "BNB-USD",
    "ripple":   "XRP-USD",
    "cardano":  "ADA-USD",
}

REGISTRY: dict[str, dict[str, str]] = {
    "commodities": COMMODITIES,
    "forex":       FOREX,
    "crypto":      CRYPTO,
}


def resolve_ticker(category: str, asset: str) -> str:
    cat = REGISTRY.get(category.lower())
    if not cat:
        raise HTTPException(404, f"Unknown category '{category}'. Valid: {list(REGISTRY)}")
    ticker = cat.get(asset.lower())
    if not ticker:
        raise HTTPException(404, f"Unknown asset '{asset}'. Valid: {sorted(cat)}")
    return ticker


def fetch_history(ticker: str, period: str) -> list[dict]:
    if period not in VALID_PERIODS:
        raise HTTPException(400, f"period must be one of {sorted(VALID_PERIODS)}")
    hist = yf.Ticker(ticker).history(period=period)
    if hist.empty:
        raise HTTPException(502, "No data returned from yfinance")
    return [
        {"date": str(i.date()), "close": round(float(c), 2)}
        for i, c in zip(hist.index, hist["Close"])
    ]


@app.get("/commodities/{asset}")
def get_commodity(asset: str, period: str = "1mo"):
    ticker = resolve_ticker("commodities", asset)
    return {"ticker": ticker, "asset": asset, "period": period, "data": fetch_history(ticker, period)}


@app.get("/forex/{pair}")
def get_forex(pair: str, period: str = "1mo"):
    ticker = resolve_ticker("forex", pair)
    return {"ticker": ticker, "asset": pair, "period": period, "data": fetch_history(ticker, period)}


@app.get("/crypto/{coin}")
def get_crypto(coin: str, period: str = "1mo"):
    ticker = resolve_ticker("crypto", coin)
    return {"ticker": ticker, "asset": coin, "period": period, "data": fetch_history(ticker, period)}


MACRO_COUNTRIES = [
    {"code": "USA", "name": "États-Unis",  "flag": "🇺🇸"},
    {"code": "DEU", "name": "Allemagne",   "flag": "🇩🇪"},
    {"code": "GBR", "name": "Royaume-Uni", "flag": "🇬🇧"},
    {"code": "JPN", "name": "Japon",       "flag": "🇯🇵"},
    {"code": "CHN", "name": "Chine",       "flag": "🇨🇳"},
    {"code": "CHE", "name": "Suisse",      "flag": "🇨🇭"},
    {"code": "CAN", "name": "Canada",      "flag": "🇨🇦"},
    {"code": "FRA", "name": "France",      "flag": "🇫🇷"},
]

MACRO_INDICATORS: dict[str, str] = {
    "gdp_growth":      "NGDP_RPCH",
    "cpi":             "PCPIPCH",
    "unemployment":    "LUR",
    "debt_gdp":        "GGXWDG_NGDP",
    "current_account": "BCA_NGDPD",
}

_IMF_BASE = "https://www.imf.org/external/datamapper/api/v1"
_macro_cache: dict = {"data": None, "ts": 0.0}
_MACRO_TTL = 3600


def _fetch_imf(country_code: str, imf_indicator: str) -> dict | None:
    try:
        r = requests.get(f"{_IMF_BASE}/{imf_indicator}/{country_code}", timeout=10)
        r.raise_for_status()
        values: dict = r.json().get("values", {}).get(imf_indicator, {}).get(country_code, {})
        if not values:
            return None
        current_year = int(time.strftime("%Y"))
        for year in sorted(values.keys(), reverse=True):
            if int(year) > current_year:
                continue
            v = values[year]
            if v is not None:
                return {"value": round(float(v), 1), "year": str(year)}
        return None
    except Exception:
        return None


@app.get("/macro")
def get_macro():
    now = time.time()
    if _macro_cache["data"] and now - _macro_cache["ts"] < _MACRO_TTL:
        return _macro_cache["data"]

    country_map = {c["code"]: {**c, "indicators": {}} for c in MACRO_COUNTRIES}
    tasks = [
        (c["code"], ind_key, imf_code)
        for c in MACRO_COUNTRIES
        for ind_key, imf_code in MACRO_INDICATORS.items()
    ]

    with ThreadPoolExecutor(max_workers=min(len(tasks), 20)) as executor:
        future_map = {
            executor.submit(_fetch_imf, country_code, imf_code): (country_code, ind_key)
            for country_code, ind_key, imf_code in tasks
        }
        for future in as_completed(future_map):
            country_code, ind_key = future_map[future]
            country_map[country_code]["indicators"][ind_key] = future.result()

    result = [country_map[c["code"]] for c in MACRO_COUNTRIES]
    _macro_cache["data"] = result
    _macro_cache["ts"] = now
    return result


def _fetch_asset_snapshot(category: str, asset_key: str, ticker: str) -> dict | None:
    try:
        hist = yf.Ticker(ticker).history(period="5d")
        if len(hist) < 2:
            return None
        prev   = float(hist["Close"].iloc[-2])
        curr   = float(hist["Close"].iloc[-1])
        change = (curr - prev) / prev * 100
        return {
            "category":   category,
            "asset":      asset_key,
            "ticker":     ticker,
            "price":      round(curr, 4),
            "change_pct": round(change, 2),
        }
    except Exception:
        return None


@app.get("/snapshot")
def get_snapshot():
    tasks = [
        (category, asset_key, ticker)
        for category, assets in REGISTRY.items()
        for asset_key, ticker in assets.items()
    ]
    results = []
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(_fetch_asset_snapshot, *t): t for t in tasks}
        for future in as_completed(futures):
            item = future.result()
            if item:
                results.append(item)
    return results


COMMENTARY_MODES = {"quick", "detailed"}

@app.get("/commentary/{category}/{asset}")
def get_commentary(category: str, asset: str, period: str = "1mo", mode: str = "quick"):
    if mode not in COMMENTARY_MODES:
        raise HTTPException(400, f"mode must be one of {COMMENTARY_MODES}")

    api_key = os.environ.get("GROQ_KEY", "")
    if not api_key:
        raise HTTPException(503, "GROQ_API_KEY not configured")

    ticker = resolve_ticker(category, asset)
    data   = fetch_history(ticker, period)

    first      = data[0]["close"]
    latest     = data[-1]["close"]
    change_pct = (latest - first) / first * 100
    high       = max(p["close"] for p in data)
    low        = min(p["close"] for p in data)

    base = (
        f"Le prix de {asset} ({ticker}) a évolué de {change_pct:+.2f}% sur la période {period} "
        f"(de {first:,.2f} à {latest:,.2f}, plus haut {high:,.2f}, plus bas {low:,.2f})."
    )

    if mode == "quick":
        model  = "llama-3.1-8b-instant"
        prompt = (
            f"{base}\n\n"
            f"Tu es un analyste financier. Analyse ce mouvement en 2-3 phrases. "
            f"Appuie-toi sur ta connaissance des marchés, des facteurs macro et de l'historique de cet actif. "
            f"Sois direct. Sans titre ni markdown."
        )
    else:
        model  = "groq/compound-mini"
        prompt = (
            f"{base}\n\n"
            f"Recherche les événements récents — actualité économique, décisions de banques centrales, "
            f"tensions géopolitiques, données macro — qui expliquent ce mouvement. "
            f"Cite les faits concrets que tu trouves. "
            f"Si tu ne trouves rien de pertinent, dis-le en une phrase. "
            f"Ne spécule pas. 2-3 phrases max, sans titre ni markdown."
        )

    try:
        client     = Groq(api_key=api_key)
        completion = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            **({"max_tokens": 250, "temperature": 0.3} if mode == "quick" else {}),
        )
    except Exception as e:
        status = getattr(e, "status_code", 500)
        raise HTTPException(status, f"Groq error: {type(e).__name__}")

    return {
        "commentary": completion.choices[0].message.content.strip(),
        "asset": asset,
        "period": period,
        "mode": mode,
    }
