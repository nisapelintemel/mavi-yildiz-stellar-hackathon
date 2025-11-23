import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { Planting } from "@/lib/types"

interface PlantingsTableProps {
  plantings: Planting[]
}

export default function PlantingsTable({ plantings }: PlantingsTableProps) {
  if (plantings.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-green-700 mb-4">Geçmiş Ekimler</h2>
        <p className="text-gray-500 text-center py-8">Henüz ekim bildirimi yapılmadı.</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-green-700 mb-4">Geçmiş Ekimler</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Sıra</TableHead>
              <TableHead>Şehir</TableHead>
              <TableHead>Ürün</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Tarih</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plantings.map((planting) => (
              <TableRow key={planting.id}>
                <TableCell className="font-medium">{planting.id}</TableCell>
                <TableCell>{planting.city}</TableCell>
                <TableCell>{planting.crop}</TableCell>
                <TableCell>
                  {planting.earnsReward ? (
                    <Badge className="bg-green-500 hover:bg-green-600">Ödül Kazandı</Badge>
                  ) : (
                    <Badge variant="destructive">Kazanmıyor</Badge>
                  )}
                </TableCell>
                <TableCell>{planting.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
