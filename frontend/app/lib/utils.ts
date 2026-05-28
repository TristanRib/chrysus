export function formatPrice(price: number): string {
  if (price >= 100) {
    return price.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (price >= 1) {
    return price.toLocaleString("fr-FR", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  }
  return price.toLocaleString("fr-FR", { minimumFractionDigits: 4, maximumFractionDigits: 6 });
}
