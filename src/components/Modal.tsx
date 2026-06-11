import { useEffect, useRef, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export function Modal({ open, title, children, onClose }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={onClose}
      aria-label={title}
      className="w-full max-w-lg rounded-karte bg-karte p-6 text-text shadow-schwebend-lg backdrop:bg-tinte/50 backdrop:backdrop-blur-sm"
    >
      {open && (
        <>
          <h2 className="mb-3 text-lg font-semibold">{title}</h2>
          {children}
        </>
      )}
    </dialog>
  );
}
