# Chrysus

Visualiseur de marchés financiers — cours en temps réel, graphiques et comparaison multi-actifs.

## Stack

| Couche    | Technologie              |
|-----------|--------------------------|
| Frontend  | Next.js 15, Recharts     |
| API       | FastAPI, yfinance        |
| Données   | Yahoo Finance (yfinance) |

## Structure

```
chrysus/
├── api/          # FastAPI — endpoints marché
│   ├── main.py
│   └── requirements.txt
└── frontend/     # Next.js App Router
    └── app/
        ├── marches/          # Explorer + Comparer
        │   └── [ticker]/     # Graphique par actif
        ├── components/
        └── lib/assets.ts     # Référentiel des actifs
```

## Lancer le projet

### API

```bash
cd api
python -m venv .venv
source .venv/bin/activate  # Windows : .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
# → http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

## API

Base URL : `http://localhost:8000`

| Endpoint                        | Exemple                          |
|---------------------------------|----------------------------------|
| `GET /commodities/{asset}`      | `/commodities/gold?period=1mo`   |
| `GET /forex/{pair}`             | `/forex/eurusd?period=3mo`       |
| `GET /crypto/{coin}`            | `/crypto/bitcoin?period=1y`      |

**Paramètre `period`** : `1d` `5d` `1mo` `3mo` `6mo` `1y`

**Actifs disponibles**

| Catégorie          | Valeurs acceptées                                          |
|--------------------|------------------------------------------------------------|
| Commodities        | `gold` `silver` `oil` `gas` `copper` `wheat`              |
| Forex              | `eurusd` `gbpusd` `usdjpy` `usdchf` `audusd` `usdcad`    |
| Crypto             | `bitcoin` `ethereum` `solana` `bnb` `ripple` `cardano`    |

**Réponse**

```json
{
  "ticker": "GC=F",
  "asset": "gold",
  "period": "1mo",
  "data": [
    { "date": "2025-04-28", "close": 3291.10 },
    ...
  ]
}
```
