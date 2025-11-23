// Dynamic import kullanarak SSR hatasını önle
export async function connectWallet(): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("Bu fonksiyon sadece tarayıcıda çalışır")
  }

  // Freighter API'yi sadece client-side'da yükle
  const { isConnected, getAddress, requestAccess } = await import("@stellar/freighter-api")
  
  const { isConnected: ok } = await isConnected().catch(() => ({ isConnected: false }))
  if (!ok) {
    throw new Error("Freighter eklentisi yüklü değil veya bağlı değil")
  }
  
  let addrObj = await getAddress()
  if (!addrObj.address) {
    addrObj = await requestAccess()
  }
  
  if (addrObj.error || !addrObj.address) {
    throw new Error("Cüzdan adresi alınamadı")
  }
  
  // Persist connected wallet for auto-login (frontend side)
  try {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      localStorage.setItem("walletAddress", addrObj.address);
    }
  } catch (e) {
    // ignore storage errors
  }

  return addrObj.address
}

export function getStoredWalletAddress(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("walletAddress");
  } catch (e) {
    return null;
  }
}