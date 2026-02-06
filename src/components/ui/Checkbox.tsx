// FlyOn — Checkbox Component v1.4.0 | 2026-02-06

import styles from './ui.module.css';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  suffix?: string;
}

export default function Checkbox({ label, checked, onChange, suffix }: CheckboxProps) {
  return (
    <label className={styles.checkboxLabel}>
      <input
        type="checkbox"
        className={styles.checkboxInput}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
      {suffix && <span style={{ marginLeft: 'auto', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>{suffix}</span>}
    </label>
  );
}
