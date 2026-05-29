import { patchMermaidManager } from '../manager';

// Mock the bundled mermaid library so the patch can be exercised without a
// real DOM-driven render. The manager dynamically imports 'mermaid'.
jest.mock('mermaid', () => ({
  __esModule: true,
  default: {
    version: '11.15.0-test',
    initialize: jest.fn(),
    render: jest.fn(async (_id: string, _text: string) => ({
      svg: '<svg>venn</svg>',
      diagramDescription: 'a venn diagram'
    }))
  }
}));

describe('patchMermaidManager', () => {
  it('replaces the five IMermaidManager methods on the target object', async () => {
    const manager: any = {};
    await patchMermaidManager(manager, null);
    expect(typeof manager.getMermaid).toBe('function');
    expect(typeof manager.getMermaidVersion).toBe('function');
    expect(typeof manager.renderSvg).toBe('function');
    expect(typeof manager.renderFigure).toBe('function');
    expect(typeof manager.getCachedFigure).toBe('function');
  });

  it('reports the bundled mermaid version after patching', async () => {
    const manager: any = {};
    await patchMermaidManager(manager, null);
    expect(manager.getMermaidVersion()).toBe('11.15.0-test');
  });

  it('renders a figure element from the patched manager', async () => {
    const manager: any = {};
    await patchMermaidManager(manager, null);
    const figure = await manager.renderFigure('venn-beta\n  set A');
    expect(figure).toBeInstanceOf(HTMLElement);
    expect(figure.classList.contains('jp-RenderedMermaid')).toBe(true);
    expect(figure.querySelector('img')).not.toBeNull();
  });

  it('caches rendered figures for getCachedFigure', async () => {
    const manager: any = {};
    await patchMermaidManager(manager, null);
    const text = 'graph TD\n  A-->B';
    expect(manager.getCachedFigure(text)).toBeNull();
    await manager.renderFigure(text);
    expect(manager.getCachedFigure(text)).not.toBeNull();
  });
});
