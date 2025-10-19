import Link from 'next/link';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { KeyboardShortcutsPanel } from '@/components/help/keyboard-shortcuts-panel';
import { useKeyboardShortcuts, commonShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Users, BarChart3, Keyboard, Lightbulb, Shield, Zap } from 'lucide-react';

export default function Home() {
  const shortcuts = [
    {
      ...commonShortcuts.help,
      action: () => {
        // Help action
      },
    },
  ];

  useKeyboardShortcuts(shortcuts);

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
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <ResponsiveContainer>
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">MOPC</span>
              </div>
              <span className="font-semibold text-lg">Plataforma de Expropiación</span>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <KeyboardShortcutsPanel shortcuts={shortcuts}>
                <Button variant="ghost" size="sm" aria-label="Atajos de teclado">
                  <Keyboard className="h-4 w-4" />
                </Button>
              </KeyboardShortcutsPanel>
            </div>
          </div>
        </ResponsiveContainer>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="py-20 sm:py-32">
          <ResponsiveContainer>
            <div className="text-center space-y-8">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                Plataforma de Gestión de
                <span className="block text-primary">Expropiación</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Sistema integral para la gestión y seguimiento de casos de expropiación en la República Dominicana.
                Moderno, accesible y seguro.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/login">
                  <Button size="lg" className="w-full sm:w-auto min-w-[140px]">
                    Iniciar Sesión
                  </Button>
                </Link>
                <KeyboardShortcutsPanel shortcuts={shortcuts}>
                  <Button variant="outline" size="lg" className="w-full sm:w-auto min-w-[140px]">
                    <Keyboard className="h-4 w-4 mr-2" />
                    Atajos
                  </Button>
                </KeyboardShortcutsPanel>
              </div>
            </div>
          </ResponsiveContainer>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <ResponsiveContainer>
            <div className="space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                  Características Principales
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Una solución completa diseñada para optimizar el proceso de expropiación con tecnología de vanguardia
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <Card
                    key={index}
                    className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:-translate-y-1 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <feature.icon className={`h-6 w-6 ${feature.color}`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            {feature.title}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </ResponsiveContainer>
        </section>

        {/* Accessibility Section */}
        <section className="py-20">
          <ResponsiveContainer>
            <div className="text-center space-y-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                Accesibilidad e Inclusión
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Diseñado siguiendo los estándares WCAG 2.1 AA para garantizar que todos los usuarios puedan acceder y utilizar la plataforma sin barreras.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">⌨️</span>
                  </div>
                  <h3 className="font-semibold">Navegación por Teclado</h3>
                  <p className="text-sm text-muted-foreground">Acceso completo a todas las funciones</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <h3 className="font-semibold">Alto Contraste</h3>
                  <p className="text-sm text-muted-foreground">Modo oscuro y opciones visuales</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">📱</span>
                  </div>
                  <h3 className="font-semibold">Diseño Responsivo</h3>
                  <p className="text-sm text-muted-foreground">Optimizado para todos los dispositivos</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">🔊</span>
                  </div>
                  <h3 className="font-semibold">Lector de Pantalla</h3>
                  <p className="text-sm text-muted-foreground">Compatible con lectores de pantalla</p>
                </div>
              </div>
            </div>
          </ResponsiveContainer>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <ResponsiveContainer>
            <div className="text-center space-y-8">
              <h2 className="text-3xl sm:text-4xl font-bold">
                ¿Listo para optimizar la gestión de casos?
              </h2>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Únase a la plataforma digital moderna para la gestión de expropiaciones en la República Dominicana
              </p>
              <Link href="/login">
                <Button size="lg" variant="secondary" className="min-w-[140px]">
                  Comenzar Ahora
                </Button>
              </Link>
            </div>
          </ResponsiveContainer>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <ResponsiveContainer>
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
        </ResponsiveContainer>
      </footer>
    </div>
  );
}