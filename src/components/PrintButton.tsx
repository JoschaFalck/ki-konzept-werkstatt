import { ui } from '../../content/ui-strings';
import { Button } from './Button';

export function PrintButton() {
  return (
    <Button variant="secondary" onClick={() => window.print()} className="print:hidden">
      {ui.app.drucken}
    </Button>
  );
}
