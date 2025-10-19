'use client';

import { useKeyboardShortcuts, commonShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { KeyboardShortcutsPanel } from '@/components/help/keyboard-shortcuts-panel';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';
import { Keyboard } from 'lucide-react';

interface HomePageClientProps {
  features: Array<{
    icon: any;
    title: string;
    description: string;
    color: string;
    bgColor: string;
  }>;
}

export function HomePageClient({ features }: HomePageClientProps) {
  const shortcuts = [
    {
      ...commonShortcuts.help,
      action: () => {
        // Help action - this could open a modal or navigate to help
        console.log('Help requested');
      },
    },
  ];

  useKeyboardShortcuts(shortcuts);

  return (
    <>
      {/* Header with client-side interactivity */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
        </div>
      </header>

      {/* Hero Section with client-side buttons */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
              <a
                href="/login"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 py-2 w-full sm:w-auto min-w-[140px]"
              >
                Iniciar Sesión
              </a>
              <KeyboardShortcutsPanel shortcuts={shortcuts}>
                <Button variant="outline" size="lg" className="w-full sm:w-auto min-w-[140px]">
                  <Keyboard className="h-4 w-4 mr-2" />
                  Atajos
                </Button>
              </KeyboardShortcutsPanel>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
                <div
                  key={index}
                  className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:-translate-y-1 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 rounded-lg bg-card text-card-foreground"
                >
                  <div className="p-6">
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Accessibility Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <h2 className="text-3xl sm:text-4xl font-bold">
              ¿Listo para optimizar la gestión de casos?
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Únase a la plataforma digital moderna para la gestión de expropiaciones en la República Dominicana
            </p>
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-11 px-8 py-2 min-w-[140px]"
            >
              Comenzar Ahora
            </a>
          </div>
        </div>
      </section>
    </>
  );
}