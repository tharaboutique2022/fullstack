import type { ProductCategory, ProductCategoryKind } from '@ecomm/shared/api.types';
import {
  CATEGORY_KIND_META,
  type CategoryTreeNode,
  getKindBadgeClass,
  getSuggestedChildKind,
} from '@/lib/categoryHelpers';

interface CategoryTreeViewProps {
  nodes: CategoryTreeNode[];
  onEdit: (category: ProductCategory) => void;
  onDelete: (category: ProductCategory) => void;
  onAddChild: (parent: ProductCategory, kind: ProductCategoryKind) => void;
}

export function CategoryTreeView({ nodes, onEdit, onDelete, onAddChild }: CategoryTreeViewProps) {
  if (!nodes.length) {
    return (
      <div className="category-tree-empty">
        <p>No categories yet.</p>
        <p className="muted">Start by adding a shop section (e.g. Women, Men, Beauty).</p>
      </div>
    );
  }

  return (
    <div className="category-tree">
      {nodes.map((node) => (
        <CategoryTreeNodeRow
          key={node.id}
          node={node}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
        />
      ))}
    </div>
  );
}

function CategoryTreeNodeRow({
  node,
  onEdit,
  onDelete,
  onAddChild,
}: {
  node: CategoryTreeNode;
  onEdit: (category: ProductCategory) => void;
  onDelete: (category: ProductCategory) => void;
  onAddChild: (parent: ProductCategory, kind: ProductCategoryKind) => void;
}) {
  const meta = CATEGORY_KIND_META[node.kind];
  const childKind = getSuggestedChildKind(node);

  return (
    <>
      <div className="category-tree-row" style={{ paddingLeft: `${12 + node.depth * 24}px` }}>
        <div className="category-tree-main">
          <span className={getKindBadgeClass(node.kind)}>{meta.badge}</span>
          <div className="category-tree-text">
            <strong>{node.name}</strong>
            <span className="muted">{meta.label}</span>
          </div>
          {!node.isActive ? <span className="status-pill inactive">Hidden</span> : null}
        </div>
        <div className="table-actions">
          {childKind ? (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onAddChild(node, childKind)}
            >
              + {CATEGORY_KIND_META[childKind].label}
            </button>
          ) : null}
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => onEdit(node)}>
            Edit
          </button>
          <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(node)}>
            Delete
          </button>
        </div>
      </div>
      {node.children.map((child) => (
        <CategoryTreeNodeRow
          key={child.id}
          node={child}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
        />
      ))}
    </>
  );
}
