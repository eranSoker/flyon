// FlyOn — Home Page v1.3.0 | 2026-02-06

import { Suspense } from 'react';
import styles from './page.module.css';
import SearchFormWrapper from './SearchFormWrapper';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <h1 className={styles.title}>FlyOn</h1>
        <p className={styles.subtitle}>Find the best flights, instantly.</p>
      </div>
      <Suspense fallback={<div className={styles.formSkeleton} />}>
        <SearchFormWrapper />
      </Suspense>
    </main>
  );
}
