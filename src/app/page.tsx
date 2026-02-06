// FlyOn — Home Page v1.0.1 | 2026-02-06

import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <h1 className={styles.title}>FlyOn</h1>
        <p className={styles.subtitle}>Find the best flights, instantly.</p>
      </div>
    </main>
  );
}
