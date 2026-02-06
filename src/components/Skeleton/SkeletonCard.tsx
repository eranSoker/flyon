// FlyOn — SkeletonCard Component v1.3.2 | 2026-02-06

import styles from './Skeleton.module.css';

export default function SkeletonCard() {
  return (
    <div className={styles.card} aria-label="Loading flight card">
      <div className={styles.priceBlock}>
        <div className={`${styles.skeleton} ${styles.priceLine}`} />
        <div className={`${styles.skeleton} ${styles.priceSubline}`} />
      </div>
      <div className={styles.flightBlock}>
        <div className={styles.timesRow}>
          <div className={`${styles.skeleton} ${styles.timeLine}`} />
          <div className={`${styles.skeleton} ${styles.routeLine}`} />
          <div className={`${styles.skeleton} ${styles.timeLine}`} />
        </div>
        <div className={styles.metaRow}>
          <div className={`${styles.skeleton} ${styles.metaLine}`} />
          <div className={`${styles.skeleton} ${styles.metaLine}`} />
        </div>
      </div>
      <div className={styles.airlineBlock}>
        <div className={`${styles.skeleton} ${styles.airlineLine}`} />
        <div className={`${styles.skeleton} ${styles.expandLine}`} />
      </div>
    </div>
  );
}
