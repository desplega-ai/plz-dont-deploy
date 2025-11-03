import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Download, Settings } from "lucide-react";

export const InputNode = memo(({ data, selected, id }: NodeProps) => {
  return (
    <div
      className={`px-6 py-4 shadow-lg rounded-lg border-2 ${selected ? 'border-blue-600 ring-2 ring-blue-300' : 'border-blue-500'} bg-white min-w-[200px] cursor-pointer transition-shadow hover:shadow-xl`}
      role="article"
      aria-label={`Input node: ${data.label as string}`}
      aria-selected={selected}
      data-testid={`workflow-node-input-${id}`}
      data-node-type="input"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
          <Download className="w-5 h-5 text-blue-600" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-gray-900">{data.label as string}</div>
          <div className="text-xs text-gray-500">Input Source</div>
        </div>
        {selected && (
          <Settings className="w-4 h-4 text-blue-600" aria-label="Node is selected" />
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-blue-500"
        aria-label="Connection point: output"
        data-testid={`workflow-handle-source-${id}`}
      />
    </div>
  );
});

InputNode.displayName = "InputNode";
