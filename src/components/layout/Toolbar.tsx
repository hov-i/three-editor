import { Button } from "@/components/ui/button/button";

export function Toolbar() {
  return (
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
  );
}
