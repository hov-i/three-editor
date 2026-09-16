import { Button } from '@/components/ui/button';

function App() {
  return (
    <div className="flex h-screen w-screen flex-col bg-background text-foreground">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
        <span className="mr-4 text-sm font-semibold">three-editor</span>
        <Button size="sm" variant="secondary">
          Add Cube
        </Button>
        <Button size="sm" variant="secondary">
          Add Sphere
        </Button>
        <Button size="sm" variant="outline" className="ml-auto">
          Reset
        </Button>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="w-56 shrink-0 border-r p-3">
          <p className="text-xs font-medium text-muted-foreground">Scene</p>
        </aside>

        <main className="min-w-0 flex-1 bg-muted/30">
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            three.js canvas
          </div>
        </main>

        <aside className="w-64 shrink-0 border-l p-3">
          <p className="text-xs font-medium text-muted-foreground">Inspector</p>
        </aside>
      </div>
    </div>
  );
}

export default App;
