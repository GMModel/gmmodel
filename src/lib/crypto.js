export const CRYPTO_NETWORKS = {
  bep20: { label: "BEP20 (BNB Smart Chain)", address: process.env.CRYPTO_BEP20_ADDRESS },
  trc20: { label: "TRC20 (Tron)", address: process.env.CRYPTO_TRC20_ADDRESS },
};

export function getCryptoAddress(network) {
  return CRYPTO_NETWORKS[network]?.address || null;
}
