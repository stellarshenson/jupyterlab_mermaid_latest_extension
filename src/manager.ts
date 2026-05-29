import type { IMermaidManager } from '@jupyterlab/mermaid';
import type { IThemeManager } from '@jupyterlab/apputils';

const MERMAID_DEFAULT_THEME = 'default';
const MERMAID_DARK_THEME = 'dark';
const MAX_CACHE_SIZE = 128;

interface ICacheEntry {
  element: HTMLElement;
}

export async function patchMermaidManager(
  manager: IMermaidManager,
  themes: IThemeManager | null
): Promise<void> {
  const cache = new Map<string, ICacheEntry>();
  let mermaidInstance: any = null;
  let mermaidVersion: string | null = null;
  let loading: Promise<any> | null = null;
  let renderCounter = 0;

  function currentTheme(): string {
    if (themes && themes.theme && themes.isLight(themes.theme) === false) {
      return MERMAID_DARK_THEME;
    }
    return MERMAID_DEFAULT_THEME;
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
      mermaidVersion = (m as any).version ?? null;
      m.initialize({
        startOnLoad: false,
        theme: currentTheme() as any,
        fontFamily:
          'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace',
        securityLevel: 'strict',
        maxTextSize: 100000
      });
      mermaidInstance = m;
      console.log(
        `jupyterlab_mermaid_latest_extension: loaded mermaid ${mermaidVersion}`
      );
      return m;
    })();
    return loading;
  }

  function cleanSvg(svg: string): string {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
    const entityDeclarations = [
      '<!DOCTYPE svg [',
      '<!ENTITY nbsp "&#160;">',
      '<!ENTITY amp "&#38;">',
      '<!ENTITY lt "&#60;">',
      '<!ENTITY gt "&#62;">',
      '<!ENTITY copy "&#169;">',
      '<!ENTITY reg "&#174;">',
      ']>'
    ].join('\n');
    let cleaned = svg;
    if (cleaned.startsWith('<svg')) {
      cleaned = `${xmlHeader}\n${entityDeclarations}\n${cleaned}`;
    }
    return cleaned;
  }

  function evictOldest(): void {
    if (cache.size >= MAX_CACHE_SIZE) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }
  }

  function createFigure(svgString: string, title?: string): HTMLElement {
    const figure = document.createElement('figure');
    figure.className = 'jp-RenderedMermaid';
    const img = document.createElement('img');
    img.src = `data:image/svg+xml,${encodeURIComponent(svgString)}`;
    if (title) {
      img.alt = title;
    }
    figure.appendChild(img);
    return figure;
  }

  function createErrorElement(error: string, text: string): HTMLElement {
    const figure = document.createElement('figure');
    figure.className = 'jp-RenderedMermaid jp-mod-warning';
    const pre = document.createElement('pre');
    pre.className = 'mermaid';
    pre.textContent = text;
    figure.appendChild(pre);
    const details = document.createElement('details');
    details.className = 'jp-RenderedMermaid-Details';
    const summary = document.createElement('summary');
    summary.className = 'jp-RenderedMermaid-Summary';
    summary.textContent = 'Mermaid Syntax Error';
    details.appendChild(summary);
    const errorPre = document.createElement('pre');
    errorPre.textContent = error;
    details.appendChild(errorPre);
    figure.appendChild(details);
    return figure;
  }

  // Patch getMermaid
  (manager as any).getMermaid = async (): Promise<any> => {
    return ensureMermaid();
  };

  // Patch getMermaidVersion
  (manager as any).getMermaidVersion = (): string | null => {
    return mermaidVersion;
  };

  // Patch renderSvg
  (manager as any).renderSvg = async (
    text: string
  ): Promise<IMermaidManager.IRenderInfo> => {
    const m = await ensureMermaid();
    m.initialize({ theme: currentTheme() });
    const id = `mermaid-${Date.now()}-${renderCounter++}`;
    try {
      const result = await m.render(id, text);
      const svg = cleanSvg(result.svg);
      return {
        text,
        svg,
        accessibleTitle: result.diagramDescription ?? null,
        accessibleDescription: null
      };
    } catch (err: any) {
      throw new Error(err?.message ?? String(err));
    }
  };

  // Patch renderFigure
  (manager as any).renderFigure = async (
    text: string
  ): Promise<HTMLElement> => {
    const cached = cache.get(text);
    if (cached) {
      return cached.element.cloneNode(true) as HTMLElement;
    }
    try {
      const info = await (manager as any).renderSvg(text);
      const figure = createFigure(info.svg, info.accessibleTitle);
      evictOldest();
      cache.set(text, { element: figure });
      return figure.cloneNode(true) as HTMLElement;
    } catch (err: any) {
      const figure = createErrorElement(err.message ?? String(err), text);
      return figure;
    }
  };

  // Patch getCachedFigure
  (manager as any).getCachedFigure = (text: string): HTMLElement | null => {
    const cached = cache.get(text);
    if (cached) {
      return cached.element.cloneNode(true) as HTMLElement;
    }
    return null;
  };

  // Clear cache on theme change
  if (themes) {
    themes.themeChanged.connect(() => {
      cache.clear();
      if (mermaidInstance) {
        mermaidInstance.initialize({ theme: currentTheme() });
      }
    });
  }

  // Eagerly load mermaid so it's ready when first diagram appears
  await ensureMermaid();
}
