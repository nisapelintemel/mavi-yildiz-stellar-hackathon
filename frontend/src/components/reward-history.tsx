//components/reward-history.ts




import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { History } from "lucide-react"
import type { FarmingAction } from "@/lib/types"

interface RewardHistoryProps {
  actions: FarmingAction[]
}

export default function RewardHistory({ actions }: RewardHistoryProps) {
  if (actions.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Geçmiş Aksiyonlar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">Henüz aksiyon bildiriminiz bulunmuyor.</p>
        </CardContent>
      </Card>
    )
  }

  // Calculate success rate
  const successCount = actions.filter((action) => action.rewarded).length
  const successRate = actions.length > 0 ? Math.round((successCount / actions.length) * 100) : 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Geçmiş Aksiyonlar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="text-sm text-gray-500">Başarı Oranı</div>
            <div className="text-xl font-bold">{successRate}%</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Toplam Aksiyon</div>
            <div className="text-xl font-bold">{actions.length}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Kazanılan Token</div>
            <div className="text-xl font-bold">{successCount * 15}</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarih</TableHead>
                <TableHead>Aksiyon</TableHead>
                <TableHead>Durum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actions.map((action) => (
                <TableRow key={action.id}>
                  <TableCell className="whitespace-nowrap">{action.date}</TableCell>
                  <TableCell>
                    <div className="font-medium">{action.actionType}</div>
                    <div className="text-xs text-gray-500">
                      {action.weatherCondition}, {action.temperature}°C
                    </div>
                  </TableCell>
                  <TableCell>
                    {action.rewarded ? (
                      <Badge className="bg-green-500 hover:bg-green-600">+{action.rewardAmount} Token</Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">
                        Ödül Yok
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
