const items = [
  ['Plan', 'Start with essential content on a narrow screen.'],
  ['Build', 'Add layout changes as more space becomes available.'],
  ['Check', 'Inspect wrapping, spacing, and horizontal scrolling.']
];
export function ResponsiveSummary() {
  return (
    <section aria-labelledby="layout-heading" className="summary-section">
      <h2 id="layout-heading">A little room to plan</h2>
      <div className="summary-grid">
        {items.map(([title, text]) => <article className="summary-card" key={title}>
          <h3>{title}</h3><p>{text}</p>
        </article>)}
      </div>
    </section>
  );
}
