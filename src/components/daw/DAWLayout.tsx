import TransportBar from './TransportBar';
import Timeline from './Timeline';
import BottomPanel from './BottomPanel';
import Toolbar from './Toolbar';

const DAWLayout = () => {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      <TransportBar />
      <Toolbar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Timeline />
        <BottomPanel />
      </div>
    </div>
  );
};

export default DAWLayout;
