import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable.tsx';
import ListPanel from '@/components/ListPanel.tsx';
import PreviewPanel from '@/components/PreviewPanel.tsx';
import SidePanel from '@/components/SidePanel.tsx';

function CenterContainer() {
  return (
    <div className="center-container py-1">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={60} minSize={20} maxSize={80}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={75} minSize={20} maxSize={80}>
              <ListPanel></ListPanel>
            </ResizablePanel>
            <ResizableHandle className="hover:bg-primary bg-transparent" />
            <ResizablePanel defaultSize={25} minSize={20} maxSize={80}>
              <PreviewPanel></PreviewPanel>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle className="hover:bg-primary bg-transparent" />
        <ResizablePanel defaultSize={40} minSize={20} maxSize={80}>
          <SidePanel></SidePanel>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default CenterContainer;
