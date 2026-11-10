// Production stand-in for DialKit (site/vite.config.ts aliases 'dialkit' here in builds): the panel is hidden
// in production anyway, so the build ships the defaults instead of the library (it tripled the bundle).
import type { DialConfig, ResolvedValues } from 'dialkit';

function resolve(config: DialConfig): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(config)) {
    if (Array.isArray(value)) out[key] = value[0];
    else if (value && typeof value === 'object' && !('type' in value)) out[key] = resolve(value as DialConfig);
    else if (value && typeof value === 'object' && 'default' in value) out[key] = (value as { default: unknown }).default;
    else if (!(value && typeof value === 'object')) out[key] = value;
  }
  return out;
}

export function useDialKit<T extends DialConfig>(_name: string, config: T): ResolvedValues<T> {
  return resolve(config) as ResolvedValues<T>;
}

export function DialRoot(_props: Record<string, unknown>) {
  return null;
}
