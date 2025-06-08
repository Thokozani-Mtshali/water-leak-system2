import { getMarkerColor } from './utils';

describe('getMarkerColor', () => {
  it('returns green for resolved or closed status', () => {
    expect(getMarkerColor('critical', 'resolved')).toBe('#10B981');
    expect(getMarkerColor('low', 'closed')).toBe('#10B981');
  });

  it('returns correct color by severity when status is not resolved or closed', () => {
    expect(getMarkerColor('critical', 'pending')).toBe('#EF4444');
    expect(getMarkerColor('high', 'pending')).toBe('#F59E0B');
    expect(getMarkerColor('medium', 'pending')).toBe('#3B82F6');
    expect(getMarkerColor('low', 'pending')).toBe('#8B5CF6');
    expect(getMarkerColor('unknown', 'pending')).toBe('#64748B');
  });
});
