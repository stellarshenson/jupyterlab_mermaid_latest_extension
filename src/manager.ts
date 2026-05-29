import type { IMermaidManager } from '@jupyterlab/mermaid';
import type { IThemeManager } from '@jupyterlab/apputils';

const MERMAID_DEFAULT_THEME = 'default';
const MERMAID_DARK_THEME = 'dark';

/**
 * Swap the mermaid library used by JupyterLab's built-in MermaidManager
 * without reimplementing its rendering pipeline.
 *
 * The built-in `renderSvg` / `renderFigure` / `cleanMermaidSvg` all read the
 * library through `this.getMermaid()`, so overriding only `getMermaid()` (and
 * `getMermaidVersion()`) on the live manager instance makes every render path -
 * notebook outputs, markdown fenced blocks and `.mmd` files - use our bundled
 * mermaid while keeping JupyterLab's proven SVG handling (void-element fixup,
 * XML header, caching, theming, accessibility extraction).
 */
export async function patchMermaidManager(
  manager: IMermaidManager,
  themes: IThemeManager | null
): Promise<void> {
  let mermaidInstance: any = null;
  let mermaidVersion: string | null = null;
  let loading: Promise<any> | null = null;

  function currentTheme(): string {
    if (themes && themes.theme && !themes.isLight(themes.theme)) {
      return MERMAID_DARK_THEME;
    }
    return MERMAID_DEFAULT_THEME;
  }

  // Mirror JupyterLab's own mermaid initialisation so output matches the
  // built-in renderer exactly (same theme, font, security and limits).
  function initMermaid(m: any): void {
    const fontFamily = window
      .getComputedStyle(document.body)
      .getPropertyValue('--jp-ui-font-family');
    m.initialize({
      startOnLoad: false,
      theme: currentTheme(),
      fontFamily,
      securityLevel: 'strict',
      maxTextSize: 100000,
      maxEdges: 100000
    });
  }

  async function ensureMermaid(): Promise<any> {
    if (mermaidInstance) {
      return mermaidInstance;
    }
    if (loading) {
      return loading;
    }
    loading = (async () => {
      const mod = await import('mermaid');
      const m = mod.default;
      // mermaid 11.x does not expose `version` on the default export; read it
      // from the package manifest instead.
      try {
        const pkg = await import('mermaid/package.json');
        mermaidVersion =
          (pkg as any).default?.version ?? (pkg as any).version ?? null;
      } catch {
        mermaidVersion = null;
      }
      initMermaid(m);
      mermaidInstance = m;
      console.log(
        `jupyterlab_mermaid_latest_extension: loaded mermaid ${mermaidVersion}`
      );
      return m;
    })();
    return loading;
  }

  (manager as any).getMermaid = async (): Promise<any> => ensureMermaid();
  (manager as any).getMermaidVersion = (): string | null => mermaidVersion;

  // Re-theme our instance and drop the built-in figure cache so diagrams
  // regenerate with the new palette when the JupyterLab theme changes.
  if (themes) {
    themes.themeChanged.connect(() => {
      if (mermaidInstance) {
        initMermaid(mermaidInstance);
      }
      const diagrams = (manager as any)._diagrams;
      if (diagrams && typeof diagrams.clear === 'function') {
        diagrams.clear();
      }
    });
  }

  // Load eagerly so the first diagram renders with our library, not the
  // built-in one that may already be cached.
  await ensureMermaid();
}
