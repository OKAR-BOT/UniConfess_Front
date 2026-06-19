function MeshBackground({ variant = 'hero' }) {
  return (
    <div className={`mesh-bg mesh-bg--${variant}`} aria-hidden>
      <div className="mesh-orb mesh-orb--red" />
      <div className="mesh-orb mesh-orb--green" />
      <div className="mesh-orb mesh-orb--purple" />
      <div className="mesh-grid" />
    </div>
  );
}

export default MeshBackground;
