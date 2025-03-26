import ListPanel from '@/components/ListPanel.tsx';
import PreviewPanel from '@/components/PreviewPanel.tsx';
import SidePanel from '@/components/side-panel/SidePanel.tsx';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import useUIStore from '@/stores/ui.store.ts';

function CenterContainer() {
  const { splitPanels } = useUIStore();

  return (
    <div className="center-container p-1">
      <PanelGroup direction="horizontal">
        <Panel defaultSize={splitPanels.main.left} maxSize={80} minSize={20}>
          <PanelGroup direction="vertical">
            <Panel defaultSize={splitPanels.center.top} maxSize={80} minSize={20}>
              <ListPanel></ListPanel>
            </Panel>
            <PanelResizeHandle className="hover:bg-primary h-1 rounded bg-transparent" />
            <Panel defaultSize={splitPanels.center.bottom} maxSize={80} minSize={20}>
              <PreviewPanel></PreviewPanel>
            </Panel>
          </PanelGroup>
        </Panel>
        <PanelResizeHandle className="hover:bg-primary w-1 rounded bg-transparent" />
        <Panel defaultSize={splitPanels.main.right} maxSize={80} minSize={20}>
          <SidePanel></SidePanel>
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default CenterContainer;
