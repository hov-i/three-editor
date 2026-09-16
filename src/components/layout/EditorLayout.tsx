import { InspectorPanel } from './InspectorPanel';
import { ScenePanel } from './ScenePanel';
import { Toolbar } from './Toolbar';
import { Viewport } from './Viewport';

export function EditorLayout() {
  return (
    <div className="flex h-screen w-screen flex-col bg-background text-foreground">
      <Toolbar />
      <div className="flex min-h-0 flex-1">
        <ScenePanel />
        <Viewport />
        <InspectorPanel />
      </div>
    </div>
  );
}
