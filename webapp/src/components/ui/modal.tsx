import * as Dialog from "@radix-ui/react-dialog";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] cursor-pointer"
          onClick={onClose}
        />
        <Dialog.Content 
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] 
                     w-full max-w-lg mx-auto p-6 
                     bg-black/90 border border-white/10 rounded-xl 
                     shadow-xl backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export const ModalContent = ({ children }: { children: React.ReactNode }) => (
  <div className="relative">
    {children}
  </div>
);

export const ModalBody = ({ children }: { children: React.ReactNode }) => (
  <div className="text-white">
    {children}
  </div>
); 