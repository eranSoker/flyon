// FlyOn — Chip Component v1.4.0 | 2026-02-06

import styles from './ui.module.css';

interface ChipProps {
  label: string;
  active?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
}

export default function Chip({ label, active = false, onRemove, onClick }: ChipProps) {
  return (
    <span
      className={`${styles.chip} ${active ? styles.chipActive : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      {label}
      {onRemove && (
        <span
          className={styles.chipClose}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          role="button"
          tabIndex={0}
          aria-label={`Remove ${label}`}
        >
          ×
        </span>
      )}
    </span>
  );
}
