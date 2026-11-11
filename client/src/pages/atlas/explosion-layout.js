/**
 * Pack only visible source meshes into a non-overlapping inventory grid.
 * Every projected bounding box gets its own cell.
 */
export function createExplosionLayout(parts, aspect = 1) {
  const cards = parts.map((part) => ({
    id: part.id,
    system: part.system,
    width: Math.max(0.035, part.bounds[1][0] - part.bounds[0][0]) + 0.04,
    height: Math.max(0.035, part.bounds[1][1] - part.bounds[0][1]) + 0.04,
  }));

  const area = cards.reduce((sum, card) => sum + card.width * card.height, 0);
  const maxWidth = Math.max(0.3, ...cards.map((card) => card.width));
  const targetWidth = Math.max(
    maxWidth,
    Math.sqrt(area * Math.max(0.5, Math.min(1.5, aspect))) * 1.18,
  );

  cards.sort((a, b) => b.height - a.height || a.id.localeCompare(b.id));

  const cells = new Map();
  let x = 0;
  let y = 0;
  let row = 0;
  let usedWidth = 0;

  for (const card of cards) {
    if (x > 0 && x + card.width > targetWidth) {
      x = 0;
      y += row;
      row = 0;
    }
    cells.set(card.id, {
      x: x + card.width / 2,
      y: -y - card.height / 2,
      width: card.width,
      height: card.height,
    });
    x += card.width;
    usedWidth = Math.max(usedWidth, x);
    row = Math.max(row, card.height);
  }

  const height = y + row;
  cells.forEach((cell) => {
    cell.x -= usedWidth / 2;
    cell.y += height / 2;
  });

  return { cells, width: usedWidth, height };
}
