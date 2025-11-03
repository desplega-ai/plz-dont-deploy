import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Brain, Settings } from "lucide-react";

export const AICategoryNode = memo(({ data, selected, id }: NodeProps) => {
  const config = data.config as any;
  const isConfigured = config && (config.model || config.prompt || config.categories);
  const categoryCount = config?.categories?.length || 0;

  const ariaLabel = `AI Category node: ${data.label as string}. ${
    isConfigured
      ? `Configured with ${config.model || 'AI model'}${categoryCount > 0 ? `, ${categoryCount} output categories` : ''}`
      : 'Not configured'
  }`;

  return (
    <div
      className={`px-6 py-4 shadow-lg rounded-lg border-2 ${selected ? 'border-purple-600 ring-2 ring-purple-300' : 'border-purple-500'} bg-white min-w-[220px] cursor-pointer transition-shadow hover:shadow-xl`}
      role="article"
      aria-label={ariaLabel}
      aria-selected={selected}
      data-testid={`workflow-node-ai-category-${id}`}
      data-node-type="ai-category"
      data-configured={isConfigured}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-purple-500"
        aria-label="Connection point: input"
        data-testid={`workflow-handle-target-${id}`}
      />

      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
          <Brain className="w-5 h-5 text-purple-600" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-gray-900">{data.label as string}</div>
          <div className="text-xs text-gray-500">AI Processing</div>
        </div>
        {selected && (
          <Settings className="w-4 h-4 text-purple-600" aria-label="Node is selected" />
        )}
      </div>

      <div className="text-xs text-gray-600 border-t pt-2">
        {isConfigured ? (
          <div className="space-y-1">
            {config.model && (
              <div className="text-xs text-purple-600 font-medium">
                Model: {config.model}
              </div>
            )}
            {config.prompt && (
              <div className="text-xs text-gray-600 line-clamp-2">
                Prompt: {config.prompt.substring(0, 50)}...
              </div>
            )}
            {categoryCount > 0 && (
              <div className="text-xs text-purple-600 font-medium">
                {categoryCount} output categor{categoryCount === 1 ? 'y' : 'ies'}
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 italic">Not configured</p>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-purple-500"
        aria-label="Connection point: output"
        data-testid={`workflow-handle-source-${id}`}
      />
    </div>
  );
});

AICategoryNode.displayName = "AICategoryNode";
