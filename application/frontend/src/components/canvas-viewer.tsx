"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { CanvasRenderer } from "@/components/canvas-renderer";

interface CanvasViewerProps {
  realmId: string;
  nodeId: string;
  canvasId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CanvasViewer({
  realmId,
  nodeId,
  canvasId,
  open,
  onOpenChange,
}: CanvasViewerProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["canvas", realmId, nodeId, canvasId],
    queryFn: () => api.getCanvas(realmId, nodeId, canvasId),
    enabled: open && !!canvasId,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogTitle className="sr-only">
          {data?.name || "Canvas"}
        </DialogTitle>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="space-y-3 text-center">
              <div className="h-8 w-8 mx-auto rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-sm text-muted-foreground">
                Loading canvas...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-2">
              <p className="text-sm text-destructive">
                Failed to load canvas
              </p>
              <p className="text-xs text-muted-foreground">
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
            </div>
          </div>
        )}

        {data && <CanvasRenderer data={data} />}
      </DialogContent>
    </Dialog>
  );
}
