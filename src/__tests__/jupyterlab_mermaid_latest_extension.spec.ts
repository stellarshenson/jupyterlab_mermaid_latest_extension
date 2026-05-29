import { patchMermaidManager } from '../manager';

// Mock the bundled mermaid library so the patch can be exercised without a
// real DOM-driven render. The manager dynamically imports 'mermaid'.
const initialize = jest.fn();
jest.mock('mermaid', () => ({
  __esModule: true,
  default: {
    version: '11.15.0-test',
    initialize: (...args: unknown[]) => initialize(...args),
    render: jest.fn(async () => ({ svg: '<svg>diagram</svg>' }))
  }
}));

// The manager reads the version from the package manifest (mermaid 11.x does
// not expose `version` on the default export), so mock it too.
jest.mock(
  'mermaid/package.json',
  () => ({ __esModule: true, default: { version: '11.15.0-test' } }),
  { virtual: true }
);

describe('patchMermaidManager', () => {
  beforeEach(() => initialize.mockClear());

  it('overrides getMermaid and getMermaidVersion on the target manager', async () => {
    const manager: any = {};
    await patchMermaidManager(manager, null);
    expect(typeof manager.getMermaid).toBe('function');
    expect(typeof manager.getMermaidVersion).toBe('function');
  });

  it('does not replace the built-in render methods', async () => {
    const manager: any = {};
    await patchMermaidManager(manager, null);
    // renderSvg / renderFigure / getCachedFigure stay the built-in ones
    expect(manager.renderSvg).toBeUndefined();
    expect(manager.renderFigure).toBeUndefined();
    expect(manager.getCachedFigure).toBeUndefined();
  });

  it('getMermaid resolves to the bundled mermaid instance', async () => {
    const manager: any = {};
    await patchMermaidManager(manager, null);
    const m = await manager.getMermaid();
    expect(m.version).toBe('11.15.0-test');
  });

  it('reports the bundled mermaid version and initialises it once', async () => {
    const manager: any = {};
    await patchMermaidManager(manager, null);
    expect(manager.getMermaidVersion()).toBe('11.15.0-test');
    // eager load initialises exactly once
    expect(initialize).toHaveBeenCalledTimes(1);
    expect(initialize.mock.calls[0][0]).toMatchObject({
      securityLevel: 'strict',
      startOnLoad: false
    });
  });
});
