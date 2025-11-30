export function generateGroupKey() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let key = "";
  for (let i = 0; i < 8; i++) { // Réduit à 8 caractères pour plus de facilité
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return key;
}