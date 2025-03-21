import { Tab, Tabs } from '@heroui/react';
import { Folder, Scaling, SlidersHorizontal } from 'lucide-react';
import CompressionOptions from '@/components/side-panel/CompressionOptions.tsx';

function SidePanel() {
  return (
    <div className="size-full">
      <div className="bg-content1 size-full rounded">
        <Tabs
          placement="end"
          variant="light"
          classNames={{
            tabWrapper: 'h-full',
            panel: 'size-full',
          }}
        >
          <Tab key="compresion" title={<SlidersHorizontal className="size-4"></SlidersHorizontal>}>
            <CompressionOptions></CompressionOptions>
          </Tab>
          <Tab key="resize" title={<Scaling className="size-4"></Scaling>}>
            <div>resize</div>
          </Tab>
          <Tab key="output" title={<Folder className="size-4"></Folder>}>
            <div>output</div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}

export default SidePanel;
