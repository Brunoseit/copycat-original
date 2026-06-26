import { useState, useEffect } from 'react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Reusable confirmation dialog. With doubleConfirm, requires two clicks.
export default function ConfirmDialog({
  open, onOpenChange, title, description,
  confirmText = 'Confirmar', cancelText = 'Cancelar',
  onConfirm, doubleConfirm = false, destructive = true,
}) {
  const [step, setStep] = useState(0);

  useEffect(() => { if (!open) setStep(0); }, [open]);

  const handleConfirm = (e) => {
    if (doubleConfirm && step === 0) {
      e.preventDefault();
      setStep(1);
      return;
    }
    onConfirm?.();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-zinc-900 border-zinc-800">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-zinc-100">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-400">
            {doubleConfirm && step === 1
              ? '⚠️ Esta acción es irreversible. Pulsa de nuevo para confirmar definitivamente.'
              : description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={destructive ? 'bg-red-800 hover:bg-red-700 text-red-50' : 'bg-green-800 hover:bg-green-700 text-green-50'}
          >
            {doubleConfirm && step === 0 ? confirmText : doubleConfirm ? 'Confirmar definitivamente' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}