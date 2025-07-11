import useFileListStore from '@/stores/file-list.store.ts';
import { Progress } from '@heroui/react';

function Footer() {
  const { baseFolder, totalFiles, compressionProgress, isCompressing } = useFileListStore();

  return (
    <div className="bg-content1 flex h-[30px] w-full items-center justify-between px-4">
      <div>
        <div>
          {totalFiles} | {baseFolder}
        </div>
      </div>
      {isCompressing && (
        <div className="w-60">
          <Progress
            disableAnimation
            aria-label="compressionProgress"
            className="w-full"
            maxValue={totalFiles}
            minValue={0}
            size="sm"
            value={compressionProgress}
          ></Progress>
        </div>
      )}
    </div>
  );
}

export default Footer;
