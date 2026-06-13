import { useEffect } from 'react';
import { HashRouter, Link, Outlet, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { ui } from '../content/ui-strings';
import { CONTENT_VERSION } from './lib/content';
import { flushPersistence } from './persistenceMiddleware';
import { useAppStore } from './store';
import { Banner } from './components/Banner';
import { ModuleErrorBoundary } from './components/ErrorBoundary';
import { SaveIndicator } from './components/SaveIndicator';
import { StartScreen } from './modules/start/StartScreen';
import { DashboardScreen } from './modules/projekt/DashboardScreen';
import { DiagnoseUebersicht } from './modules/diagnose/DiagnoseUebersicht';
import { DimensionScreen } from './modules/diagnose/DimensionScreen';
import { AuswertungScreen } from './modules/diagnose/AuswertungScreen';
import { WorkshopScreen } from './modules/diagnose/WorkshopScreen';
import { ReferenzScreen } from './modules/referenz/ReferenzScreen';
import { BuilderScreen } from './modules/builder/BuilderScreen';
import { MassnahmenScreen } from './modules/massnahmen/MassnahmenScreen';
import { ProzessScreen } from './modules/prozess/ProzessScreen';
import {
  HinweiseScreen,
  HerleitungScreen,
  ImpressumScreen,
  DatenschutzScreen,
} from './modules/statisch/StatischeSeiten';
import { MaterialienScreen } from './modules/materialien/MaterialienScreen';

function StorageBanners() {
  const storageOk = useAppStore((s) => s.storageOk);
  const quotaError = useAppStore((s) => s.quotaError);
  if (storageOk && !quotaError) return null;
  return (
    <div className="mx-auto w-full max-w-werkstatt px-4 pt-4 print-hidden">
      <Banner kind="error" title={ui.storage.bannerTitel}>
        {quotaError ? ui.storage.quotaText : ui.storage.bannerText}
      </Banner>
    </div>
  );
}

function Layout() {
  const location = useLocation();
  const storageOk = useAppStore((s) => s.storageOk);

  // Sofortiges Sichern bei Routenwechsel (Spezifikation Abschnitt 4).
  useEffect(() => {
    flushPersistence();
  }, [location.pathname]);

  // Beforeunload-Warnung nur ohne localStorage und mit ungesicherten Änderungen.
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      const { unsavedSinceExport } = useAppStore.getState();
      if (!storageOk && unsavedSinceExport) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [storageOk]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="print-hidden sticky top-0 z-20 border-b border-sekundaer/10 bg-flaeche/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-werkstatt flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-semibold text-primaer">
            <span
              aria-hidden
              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-aurora-hero text-xs font-bold text-white"
            >
              KI
            </span>
            {ui.app.titel}
          </Link>
          <nav aria-label="Inhalte" className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <Link to="/referenz" className="text-sekundaer hover:text-primaer">
              {ui.app.navReferenz}
            </Link>
            <Link to="/materialien" className="text-sekundaer hover:text-primaer">
              {ui.app.navMaterial}
            </Link>
            <Link to="/prozess" className="text-sekundaer hover:text-primaer">
              {ui.app.navProzess}
            </Link>
            <Link to="/hinweise" className="text-sekundaer hover:text-primaer">
              {ui.app.navHinweise}
            </Link>
            <Link to="/herleitung" className="text-sekundaer hover:text-primaer">
              {ui.app.navHerleitung}
            </Link>
          </nav>
          <div className="ml-auto">
            <SaveIndicator />
          </div>
        </div>
      </header>
      <StorageBanners />
      <main className="mx-auto w-full max-w-werkstatt flex-1 px-4 py-8">
        <Outlet />
      </main>
      <footer className="print-hidden bg-tinte text-white/80">
        <div className="mx-auto flex w-full max-w-werkstatt flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-6 text-sm">
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <a
              href="https://www.joschafalck.de"
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-white"
            >
              {ui.app.footerLizenz}
            </a>
            <span className="text-white/50">
              {ui.app.footerVersion} {CONTENT_VERSION}
            </span>
          </span>
          <span className="flex flex-wrap gap-4">
            <Link to="/impressum" className="underline hover:text-white">
              {ui.app.impressum}
            </Link>
            <Link to="/datenschutz" className="underline hover:text-white">
              {ui.app.datenschutz}
            </Link>
            <a
              href="https://joschafalck.de/kaffeekasse/"
              target="_blank"
              rel="noreferrer noopener"
              className="underline hover:text-white"
            >
              {ui.app.kaffeekasse}
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}

/** Lädt das Projekt der Route in den Store, bevor die Modul-Screens rendern. */
function ProjectLoader() {
  const { id } = useParams<{ id: string }>();
  const ensureLoaded = useAppStore((s) => s.ensureLoaded);
  useEffect(() => {
    if (id) ensureLoaded(id);
  }, [id, ensureLoaded]);
  return (
    <ModuleErrorBoundary>
      <Outlet />
    </ModuleErrorBoundary>
  );
}

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<StartScreen />} />
          <Route path="/p/:id" element={<ProjectLoader />}>
            <Route index element={<DashboardScreen />} />
            <Route path="diagnose" element={<DiagnoseUebersicht />} />
            <Route path="diagnose/auswertung" element={<AuswertungScreen />} />
            <Route path="diagnose/:dim" element={<DimensionScreen />} />
            <Route path="referenz" element={<ReferenzScreen />} />
            <Route path="referenz/:dim" element={<ReferenzScreen />} />
            <Route path="builder" element={<BuilderScreen />} />
            <Route path="builder/:section" element={<BuilderScreen />} />
            <Route path="massnahmen" element={<MassnahmenScreen />} />
            <Route path="prozess" element={<ProzessScreen />} />
          </Route>
          {/* Projektfreies Stöbern (S7/S10 ohne Projektkontext) */}
          <Route path="/referenz" element={<ReferenzScreen />} />
          <Route path="/referenz/:dim" element={<ReferenzScreen />} />
          <Route path="/prozess" element={<ProzessScreen />} />
          <Route path="/materialien" element={<MaterialienScreen />} />
          <Route path="/hinweise" element={<HinweiseScreen />} />
          <Route path="/herleitung" element={<HerleitungScreen />} />
          <Route path="/impressum" element={<ImpressumScreen />} />
          <Route path="/datenschutz" element={<DatenschutzScreen />} />
        </Route>
        {/* Workshop-Modus ohne App-Chrome (S6) */}
        <Route path="/p/:id/diagnose/workshop" element={<ProjectLoader />}>
          <Route index element={<WorkshopScreen />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
