import TransportBar from './TransportBar';
import Timeline from './Timeline';
import BottomPanel from './BottomPanel';
import Toolbar from './Toolbar';
import PerformanceMonitor from './PerformanceMonitor';
import ExportDialog from './ExportDialog';
import CollabModal from './CollabModal';

const DAWLayout = () => {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      <TransportBar />
      <Toolbar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Timeline />
        <BottomPanel />
        <PerformanceMonitor />
      </div>
      <ExportDialog />
      <CollabModal />
    </div>
  );
};

export default DAWLayout;
