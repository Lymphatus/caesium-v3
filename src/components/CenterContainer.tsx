import ListPanel from '@/components/ListPanel.tsx';
import PreviewPanel from '@/components/PreviewPanel.tsx';
import SidePanel from '@/components/side-panel/SidePanel.tsx';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

function CenterContainer() {
  return (
    <div className="center-container p-1">
      <PanelGroup direction="horizontal">
        <Panel defaultSize={70} minSize={20} maxSize={80}>
          <PanelGroup direction="vertical">
            <Panel defaultSize={60} minSize={20} maxSize={80}>
              <ListPanel></ListPanel>
            </Panel>
            <PanelResizeHandle className="hover:bg-primary bg-transparent h-1 rounded" />
            <Panel defaultSize={40} minSize={20} maxSize={80}>
              <PreviewPanel></PreviewPanel>
            </Panel>
          </PanelGroup>
        </Panel>
        <PanelResizeHandle className="hover:bg-primary bg-transparent w-1 rounded" />
        <Panel defaultSize={30} minSize={20} maxSize={80}>
          <SidePanel></SidePanel>
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default CenterContainer;
