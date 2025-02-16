'use client';
import DemoFlow from './components/DemoFlow';
import FlowEditor from './components/FlowEditor';

export default function Page() {
  const DEMO_MODE = false; // Change this to toggle

  return DEMO_MODE ? <DemoFlow /> : <FlowEditor />;
}
