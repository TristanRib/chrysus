import { UP_COLOR, DOWN_COLOR } from "../lib/constants";

type Props = {
  value: number;
  fontSize?: string;
};

export default function ChangeTag({ value, fontSize = "0.875rem" }: Props) {
  const positive = value >= 0;
  return (
    <span style={{
      fontSize,
      fontWeight: 600,
      color: positive ? UP_COLOR : DOWN_COLOR,
      fontVariantNumeric: "tabular-nums",
    }}>
      {positive ? "+" : ""}{value.toFixed(2)}%
    </span>
  );
}
