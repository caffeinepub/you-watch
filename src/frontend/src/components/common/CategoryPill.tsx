interface CategoryPillProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export default function CategoryPill({
  label,
  active,
  onClick,
}: CategoryPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
        active
          ? "brand-gradient text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
      }`}
      data-ocid="filter.tab"
    >
      {label}
    </button>
  );
}
