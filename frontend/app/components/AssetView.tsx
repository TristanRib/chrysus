"use client";

import { useState } from "react";
import AssetChart from "./AssetChart";
import Commentary from "./Commentary";
import { type Period } from "../lib/constants";

type Props = { apiPath: string };

export default function AssetView({ apiPath }: Props) {
  const [period, setPeriod] = useState<Period>("1mo");

  return (
    <>
      <AssetChart apiPath={apiPath} period={period} onPeriodChange={setPeriod} />
      <Commentary apiPath={apiPath} period={period} />
    </>
  );
}
