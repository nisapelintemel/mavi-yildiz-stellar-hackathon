// Şehir ve ürün bazlı öneriler için yardımcı fonksiyon
export function getRecommendation(city: string, crop: string): string {
  const recommendations: Record<string, Record<string, string>> = {
    Konya: {
      Mısır: "Konya'da bu yıl mısır ekmek risklidir, su yetersiz. Nohut önerilir.",
      Nohut: "Konya'da nohut ekimi için ideal koşullar mevcut. İyi bir tercih!",
      Mercimek: "Konya'da mercimek ekimi orta düzeyde verimli olabilir.",
      Arpa: "Konya'da arpa ekimi için uygun koşullar var.",
      Buğday: "Konya'da buğday ekimi için uygun koşullar var, ancak su tasarrufu önemli.",
      Pamuk: "Konya'da pamuk ekimi önerilmez, su tüketimi çok yüksek.",
    },
    Ankara: {
      Mısır: "Ankara'da mısır ekimi için orta düzeyde uygun koşullar var.",
      Nohut: "Ankara'da nohut ekimi için ideal koşullar mevcut.",
      Mercimek: "Ankara'da mercimek ekimi verimli olabilir.",
      Arpa: "Ankara'da arpa ekimi için çok uygun koşullar var.",
      Buğday: "Ankara'da buğday ekimi için uygun koşullar var.",
      Pamuk: "Ankara'da pamuk ekimi önerilmez, iklim uygun değil.",
    },
    Yozgat: {
      Mısır: "Yozgat'ta mısır ekimi için orta düzeyde uygun koşullar var.",
      Nohut: "Yozgat'ta nohut ekimi için uygun koşullar var.",
      Mercimek: "Yozgat'ta mercimek ekimi verimli olabilir.",
      Arpa: "Yozgat'ta arpa ekimi için uygundur, buğday da tercih edilebilir.",
      Buğday: "Yozgat'ta buğday ekimi için çok uygun koşullar var.",
      Pamuk: "Yozgat'ta pamuk ekimi önerilmez, iklim uygun değil.",
    },
    Adana: {
      Mısır: "Adana'da mısır ekimi için ideal koşullar mevcut.",
      Nohut: "Adana'da nohut ekimi için uygun koşullar var.",
      Mercimek: "Adana'da mercimek ekimi orta düzeyde verimli olabilir.",
      Arpa: "Adana'da arpa ekimi için uygun koşullar var.",
      Buğday: "Adana'da buğday ekimi için uygun koşullar var.",
      Pamuk: "Adana'da pamuk ekimi için ideal koşullar mevcut. Çok iyi bir tercih!",
    },
    Manisa: {
      Mısır: "Manisa'da mısır ekimi için uygun koşullar var.",
      Nohut: "Manisa'da nohut ekimi için orta düzeyde uygun koşullar var.",
      Mercimek: "Manisa'da mercimek ekimi orta düzeyde verimli olabilir.",
      Arpa: "Manisa'da arpa ekimi için uygun koşullar var.",
      Buğday: "Manisa'da buğday ekimi için uygun koşullar var.",
      Pamuk: "Manisa'da pamuk ekimi için uygun koşullar var, ancak su yönetimi önemli.",
    },
  }

  return recommendations[city]?.[crop] || `${city} için ${crop} ekimi hakkında bilgi bulunmamaktadır.`
}
