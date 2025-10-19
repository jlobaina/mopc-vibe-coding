import { HomePageClient } from '@/components/home/home-page-client';
import { FileText, Users, BarChart3, Lightbulb, Shield, Zap } from 'lucide-react';

export default function Home() {
  // Server-side data preparation
  const features = [
    {
      icon: FileText,
      title: 'Gestión de Casos',
      description: 'Seguimiento completo del ciclo de vida de los casos de expropiación con 17 etapas documentadas',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: Users,
      title: 'Gestión de Usuarios',
      description: 'Control de acceso basado en roles jerárquicos y estructura departamental',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: BarChart3,
      title: 'Reportes y Análisis',
      description: 'Informes detallados y métricas de rendimiento en tiempo real',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: Shield,
      title: 'Seguridad y Auditoría',
      description: 'Trazabilidad completa de todas las acciones con registros inmutables',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      icon: Zap,
      title: 'Rendimiento',
      description: 'Optimizado para velocidad y accesibilidad con soporte para todos los dispositivos',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      icon: Lightbulb,
      title: 'Inteligencia Artificial',
      description: 'Asistencia inteligente para la gestión y predicción de casos',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50">
      {/* Client component with all interactivity */}
      <HomePageClient features={features} />

      {/* Footer - Server component */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">M</span>
              </div>
              <span className="font-semibold">Ministerio de Obras Públicas y Comunicaciones</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 República Dominicana. Todos los derechos reservados.
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Política de Privacidad</a>
              <a href="#" className="hover:text-foreground transition-colors">Términos de Uso</a>
              <a href="#" className="hover:text-foreground transition-colors">Accesibilidad</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}