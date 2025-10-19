import { ListPlus } from 'lucide-react';
import { t } from 'i18next';

interface DragDropOverlayProps {
  isDragging: boolean;
}

function DragDropOverlay({ isDragging }: DragDropOverlayProps) {
  return (
    <div
      className="bg-background/50 absolute top-0 left-0 z-20 flex size-full items-center justify-center backdrop-blur-sm"
      hidden={!isDragging}
    >
      <div className="flex flex-col items-center justify-center gap-2">
        <ListPlus className="size-20"></ListPlus>
        <p className="text-2xl">{t('drop_files_here')}</p>
      </div>
    </div>
  );
}

export default DragDropOverlay;
