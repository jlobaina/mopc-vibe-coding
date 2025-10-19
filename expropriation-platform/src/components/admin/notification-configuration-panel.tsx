'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function NotificationConfigurationPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Configuración de Notificaciones</h2>
        <p className="text-muted-foreground">
          Configura los canales y políticas de notificación
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Canales de Notificación</CardTitle>
          <CardDescription>
            Administra los canales de notificación del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Panel de configuración de notificaciones en desarrollo...
          </div>
        </CardContent>
      </Card>
    </div>
  )
}