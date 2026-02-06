// FlyOn — Modal Component v1.4.0 | 2026-02-06

'use client';

import { useEffect, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './ui.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  variant?: 'drawer' | 'center';
  children: ReactNode;
  footer?: ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  variant = 'drawer',
  children,
  footer,
}: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const modalContent = (
    <>
      <div className={styles.modalBackdrop} onClick={onClose} />
      <div
        className={`${styles.modal} ${variant === 'drawer' ? styles.modalDrawer : styles.modalCenter}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {variant === 'drawer' && (
          <div className={styles.modalHandle}>
            <div className={styles.modalHandleBar} />
          </div>
        )}
        {title && (
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>{title}</h2>
            <button className={styles.modalClose} onClick={onClose} aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}
        <div className={styles.modalBody}>{children}</div>
        {footer && <div className={styles.modalFooter}>{footer}</div>}
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
