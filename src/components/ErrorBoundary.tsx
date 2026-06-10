import { Component, type ReactNode } from 'react';
import { ui } from '../../content/ui-strings';
import { Button } from './Button';
import { Card } from './Card';

// ErrorBoundary pro Modul (Spezifikation Abschnitt 8): Modul zeigt
// Fehlerkarte, Rest der App bleibt nutzbar, Daten bleiben erhalten.

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ModuleErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="mx-auto max-w-prose text-center">
          <h2 className="text-lg font-semibold text-fehler">{ui.fehler.moduleTitel}</h2>
          <p className="mt-2 text-sekundaer">{ui.fehler.moduleText}</p>
          <div className="mt-4 flex justify-center">
            <Button variant="secondary" onClick={() => window.location.reload()}>
              {ui.fehler.neuLaden}
            </Button>
          </div>
        </Card>
      );
    }
    return this.props.children;
  }
}
