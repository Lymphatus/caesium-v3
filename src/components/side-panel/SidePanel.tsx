import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Folder, Scaling, SlidersHorizontal } from 'lucide-react';
import CompressionOptions from '@/components/side-panel/CompressionOptions.tsx';
import { useTranslation } from 'react-i18next';
import OutputOptions from '@/components/side-panel/OutputOptions.tsx';
import { SIDE_PANEL_TAB } from '@/types.ts';
import useUIStore from '@/stores/ui.store.ts';
import ResizeOptions from '@/components/side-panel/ResizeOptions.tsx';
import useFileListStore from '@/stores/file-list.store.ts';
import { ScrollArea } from '../ui/scroll-area';

function SidePanel() {
  const { t } = useTranslation();

  const { currentSelectedTab, setCurrentSelectedTab } = useUIStore();
  const { isCompressing } = useFileListStore();
  return (
    <ScrollArea className="bg-card size-full rounded-2xl p-1.5">
      <Tabs value={currentSelectedTab} onValueChange={(value) => setCurrentSelectedTab(value as SIDE_PANEL_TAB)}>
        <TabsList className="sticky top-0 z-10 w-full">
          <TabsTrigger disabled={isCompressing} value={SIDE_PANEL_TAB.COMPRESSION}>
            <SlidersHorizontal className="size-4" />
            <span className="text-xs font-semibold">{t('compression_options.compression')}</span>
          </TabsTrigger>
          <TabsTrigger disabled={isCompressing} value={SIDE_PANEL_TAB.RESIZE}>
            <Scaling className="size-4" />
            <span className="text-xs font-semibold">{t('compression_options.resize')}</span>
          </TabsTrigger>
          <TabsTrigger disabled={isCompressing} value={SIDE_PANEL_TAB.OUTPUT}>
            <Folder className="size-4" />
            <span className="text-xs font-semibold">{t('compression_options.output')}</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value={SIDE_PANEL_TAB.COMPRESSION}>
          <CompressionOptions />
        </TabsContent>
        <TabsContent value={SIDE_PANEL_TAB.RESIZE}>
          <ResizeOptions />
        </TabsContent>
        <TabsContent value={SIDE_PANEL_TAB.OUTPUT}>
          <OutputOptions />
        </TabsContent>
      </Tabs>
    </ScrollArea>
  );
}
export default SidePanel;
