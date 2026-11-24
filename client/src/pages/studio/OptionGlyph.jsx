export default function OptionGlyph({ group, value }) {
  if (group === 'motion') {
    return (
      <div className="fx-glyph" data-fx-value={value} aria-hidden="true">
        <div className="fx-motion">
          <i />
          <i />
          <i />
        </div>
      </div>
    );
  }

  if (group === 'bg') {
    return (
      <div className="fx-glyph" aria-hidden="true">
        <div className="fx-bg" data-fx-value={value} />
      </div>
    );
  }

  if (group === 'texture') {
    return (
      <div className="fx-glyph" aria-hidden="true">
        <div className="fx-bg" data-fx-value="plain" />
        <div className="fx-texture" data-fx-value={value} />
      </div>
    );
  }

  if (group === 'cursor') {
    return (
      <div className="fx-glyph" aria-hidden="true">
        <div className="fx-cursor" data-fx-value={value} />
      </div>
    );
  }

  if (group === 'hover') {
    return (
      <div className="fx-glyph" aria-hidden="true">
        <div className="fx-hover" data-fx-value={value} />
      </div>
    );
  }

  return null;
}
