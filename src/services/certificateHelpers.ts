export function makeCertId(): string {
  const epoch = Date.now().toString(16).toUpperCase().slice(-6);
  const randomHex = Math.floor(Math.random() * 0xfff)
    .toString(16)
    .toUpperCase()
    .padStart(3, "0");
  return `CS-NASA-${epoch}-${randomHex}`;
}
