import Link from "next/link";
import { findAsset } from "../../lib/assets";
import AssetView from "../../components/AssetView";

type Props = { params: Promise<{ ticker: string }> };

export default async function AssetPage({ params }: Props) {
  const { ticker } = await params;
  const decoded = decodeURIComponent(ticker);
  const asset = findAsset(decoded);

  if (!asset) {
    return (
      <main style={{ padding: "2rem", maxWidth: 960, margin: "0 auto" }}>
        <Link href="/marches" className="back-link">← Marchés</Link>
        <p style={{ color: "#888", marginTop: "2rem" }}>Asset inconnu : {decoded}</p>
      </main>
    );
  }

  return (
    <main style={{ padding: "2rem", maxWidth: 960, margin: "0 auto" }}>
      <Link href="/marches" className="back-link">← Marchés</Link>

      <div style={{ marginTop: "1.5rem", marginBottom: "2rem" }}>
        <span style={{ fontSize: "0.8rem", color: "#555", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {asset.category}
        </span>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, marginTop: "0.25rem" }}>
          {asset.name}
          <span style={{ marginLeft: "0.75rem", fontSize: "1rem", color: "#666", fontWeight: 400 }}>
            {asset.symbol}
          </span>
        </h1>
        <p style={{ color: "#555", fontSize: "0.8rem", marginTop: "0.25rem", fontFamily: "monospace" }}>
          {asset.apiPath}
        </p>
      </div>

      <AssetView apiPath={asset.apiPath} />
    </main>
  );
}
