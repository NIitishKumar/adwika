export function getColorHex(name: string, code: string): string {
  const normalized = (name + ' ' + code).toLowerCase();

  if (normalized.includes('midnight blue') || normalized.includes('mid-blu') || normalized.includes('navy')) {
    return '#1a2b4c';
  }
  if (normalized.includes('blue')) {
    return '#2b4c7e';
  }
  if (normalized.includes('gulabi') || normalized.includes('pink') || normalized.includes('rose')) {
    return '#d15e7d';
  }
  if (normalized.includes('ivory') || normalized.includes('white') || normalized.includes('cream')) {
    return '#f4ede4';
  }
  if (normalized.includes('terracotta') || normalized.includes('rust') || normalized.includes('brick')) {
    return '#c25a3f';
  }
  if (normalized.includes('haldi') || normalized.includes('gold') || normalized.includes('yellow') || normalized.includes('mustard')) {
    return '#d4a017';
  }
  if (normalized.includes('jamun') || normalized.includes('violet') || normalized.includes('purple')) {
    return '#4a2545';
  }
  if (normalized.includes('sage') || normalized.includes('green') || normalized.includes('olive') || normalized.includes('mehendi')) {
    return '#4d5d43';
  }
  if (normalized.includes('black') || normalized.includes('noir') || normalized.includes('jet')) {
    return '#141414';
  }
  if (normalized.includes('maroon') || normalized.includes('crimson') || normalized.includes('red') || normalized.includes('sindoor')) {
    return '#801818';
  }
  if (normalized.includes('beige') || normalized.includes('sand') || normalized.includes('taupe')) {
    return '#c2b29d';
  }

  // Fallback elegant bronze/amber
  return '#8d674f';
}
