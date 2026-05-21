export default function StarfieldBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="starfield starfield-small absolute inset-0" />
      <div className="starfield starfield-large absolute inset-0" />
    </div>
  );
}
