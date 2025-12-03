import LineraTestCounter from "@/components/LineraTestCounter";

export default function TestLineraPage() {
  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Linera Integration Test</h1>
        <p className="text-muted-foreground">
          Verify WASM client connectivity and mutation execution.
        </p>
      </div>
      
      <LineraTestCounter />
    </div>
  );
}