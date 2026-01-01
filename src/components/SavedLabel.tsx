import { ArrowDown, ArrowUp } from 'lucide-react';
import { CImage } from '@/types.ts';
import { getSavedPercentage } from '@/utils/utils.ts';

export function SavedLabel({ cImage }: { cImage: CImage }) {
  if (cImage.compressed_size === 0 || cImage.size === cImage.compressed_size) {
    return <span className="text-default-400 text-nowrap">&nbsp;</span>;
  }
  const saved = getSavedPercentage(cImage.size, cImage.compressed_size);
  const textColor = saved < 0 ? 'text-danger' : 'text-success';
  const icon = saved < 0 ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" />;
  return (
    <span className={textColor + ' flex items-center gap-0.5 text-nowrap'}>
      {icon}
      <span>{cImage.compressed_size !== 0 ? saved * -1 : 0}%</span>
    </span>
  );
}
