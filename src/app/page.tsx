// FlyOn — Home Page v1.8.2 | 2026-02-06

import { Suspense } from 'react';
import Image from 'next/image';
import styles from './page.module.css';
import SearchFormWrapper from './SearchFormWrapper';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <Image
          src="/flyon_logo.svg"
          alt="flyon"
          width={280}
          height={93}
          className={styles.logo}
          priority
        />
        <p className={styles.subtitle}>Find the best flights, instantly.</p>
      </div>
      <Suspense fallback={<div className={styles.formSkeleton} />}>
        <SearchFormWrapper />
      </Suspense>
    </main>
  );
}
