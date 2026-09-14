import { describe, expect, it } from 'vitest';
import * as satellites from '../../src/components/PhraseBuilder/satellites/index.ts';
import { buildSatellites } from '../../src/components/PhraseBuilder/satellites/functions/buildSatellites.ts';
import { buildSatelliteIcons } from '../../src/components/PhraseBuilder/satellites/functions/buildSatelliteIcons.ts';

describe('the satellites module', () => {
  it('exposes the two builders and nothing of its internals', () => {
    expect(Object.keys(satellites).sort()).toEqual(['buildSatelliteIcons', 'buildSatellites']);
    expect(satellites.buildSatellites).toBe(buildSatellites);
    expect(satellites.buildSatelliteIcons).toBe(buildSatelliteIcons);
  });
});
