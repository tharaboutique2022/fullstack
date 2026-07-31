import { CATEGORY_FLOW_STEPS } from '@/lib/categoryHelpers';

export function CategoryGuide() {
  return (
    <div className="category-guide">
      <div className="category-guide-header">
        <strong>How categories work in the app</strong>
        <span className="muted">Build top → bottom. Products are added separately in the table below.</span>
      </div>
      <div className="category-flow">
        {CATEGORY_FLOW_STEPS.map((step, index) => (
          <div key={step.level} className="category-flow-step">
            <div className="category-flow-level">Step {step.level}</div>
            <div className="category-flow-title">{step.title}</div>
            <div className="category-flow-example">{step.example}</div>
            <div className="category-flow-note">{step.note}</div>
            {index < CATEGORY_FLOW_STEPS.length - 1 ? <div className="category-flow-arrow">↓</div> : null}
          </div>
        ))}
      </div>
      <p className="category-guide-tip">
        <strong>Quick rule:</strong> Shop section → Browse section → Brand <em>or</em> Product category →
        then assign products to a <em>Product category</em> and set the brand on the product.
      </p>
    </div>
  );
}
