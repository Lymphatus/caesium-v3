import ListPanel from '@/components/file-list/ListPanel.tsx';
import PreviewPanel from '@/components/preview-panel/PreviewPanel.tsx';
import SidePanel from '@/components/side-panel/SidePanel.tsx';
import useUIStore from '@/stores/ui.store.ts';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './ui/resizable';

function CenterContainer() {
  const { panelsLayout, setPanelsLayout, showPreviewPanel } = useUIStore();

  return (
    <div className="center-container px-2">
      <ResizablePanelGroup
        id="main"
        orientation="horizontal"
        onLayoutChanged={(size) => setPanelsLayout({ main: size })}
      >
        <ResizablePanel defaultSize={panelsLayout.main.content + '%'} id="content" maxSize="80%" minSize="20%">
          <ResizablePanelGroup
            id="center"
            orientation="vertical"
            onLayoutChanged={(size) => {
              if (!showPreviewPanel) return;
              setPanelsLayout({ center: size });
            }}
          >
            <ResizablePanel defaultSize={panelsLayout.center.list + '%'} id="list" maxSize="80%" minSize="20%">
              <ListPanel></ListPanel>
            </ResizablePanel>
            {showPreviewPanel && <ResizableHandle />}
            {showPreviewPanel && (
              <ResizablePanel defaultSize={panelsLayout.center.preview + '%'} id="preview" maxSize="80%" minSize="20%">
                <PreviewPanel></PreviewPanel>
              </ResizablePanel>
            )}
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={panelsLayout.main.side + '%'} id="side" maxSize="80%" minSize="20%">
          <SidePanel></SidePanel>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default CenterContainer;
