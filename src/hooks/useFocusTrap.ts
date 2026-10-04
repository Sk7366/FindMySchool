import { useEffect, useRef } from 'react';

interface UseFocusTrapOptions {
  isOpen: boolean;
  onClose: () => void;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

export function useFocusTrap({
  isOpen,
  onClose,
  initialFocusRef,
  returnFocusRef,
}: UseFocusTrapOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Capture currently focused element to return focus on modal close
    previouslyFocusedElementRef.current = (document.activeElement as HTMLElement) || null;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Set initial focus inside modal
    const focusTimer = setTimeout(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else if (containerRef.current) {
        const focusableElements = Array.from(
          containerRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => el.offsetParent !== null || el.offsetWidth > 0 || el.offsetHeight > 0);

        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        } else {
          containerRef.current.focus();
        }
      }
    }, 30);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        if (!containerRef.current) return;

        const focusableElements = Array.from(
          containerRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => el.offsetParent !== null || el.offsetWidth > 0 || el.offsetHeight > 0);

        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement || !containerRef.current.contains(document.activeElement)) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement || !containerRef.current.contains(document.activeElement)) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);

      // Return focus to previous element or returnFocusRef
      if (returnFocusRef?.current) {
        returnFocusRef.current.focus();
      } else if (previouslyFocusedElementRef.current && typeof previouslyFocusedElementRef.current.focus === 'function') {
        previouslyFocusedElementRef.current.focus();
      }
    };
  }, [isOpen, onClose, initialFocusRef, returnFocusRef]);

  return containerRef;
}
