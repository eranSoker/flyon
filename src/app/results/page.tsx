// FlyOn — Results Page v1.3.1 | 2026-02-06

import { Suspense } from 'react';
import { SearchProvider } from '@/context/SearchContext';
import ResultsContent from './ResultsContent';
import styles from './results.module.css';

export default function ResultsPage() {
  return (
    <SearchProvider>
      <main className={styles.main}>
        <Suspense fallback={<div className={styles.loading}>Loading results...</div>}>
          <ResultsContent />
        </Suspense>
      </main>
    </SearchProvider>
  );
}
