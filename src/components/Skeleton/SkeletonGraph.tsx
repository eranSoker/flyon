// FlyOn — SkeletonGraph Component v1.3.2 | 2026-02-06

import styles from './Skeleton.module.css';

const BAR_HEIGHTS = [60, 85, 45, 100, 75, 55, 90, 40, 70, 95, 50, 80];

export default function SkeletonGraph() {
  return (
    <div className={styles.graph} aria-label="Loading price graph">
      <div className={styles.graphHeader}>
        <div className={`${styles.skeleton} ${styles.graphTitle}`} />
        <div className={`${styles.skeleton} ${styles.graphToggle}`} />
      </div>
      <div className={styles.graphBars}>
        {BAR_HEIGHTS.map((height, i) => (
          <div
            key={i}
            className={`${styles.skeleton} ${styles.graphBar}`}
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  );
}
