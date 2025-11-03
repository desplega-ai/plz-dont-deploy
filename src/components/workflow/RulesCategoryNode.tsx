import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { ListChecks, Settings } from "lucide-react";

export const RulesCategoryNode = memo(({ data, selected, id }: NodeProps) => {
  const config = data.config as any;
  const rules = config?.rules || [];
  const ruleCount = rules.length;
  const isConfigured = ruleCount > 0;

  const ariaLabel = `Rules Category node: ${data.label as string}. ${
    isConfigured
      ? `${ruleCount} rule${ruleCount === 1 ? '' : 's'} configured`
      : 'No rules configured'
  }`;

  return (
    <div
      className={`px-6 py-4 shadow-lg rounded-lg border-2 ${selected ? 'border-green-600 ring-2 ring-green-300' : 'border-green-500'} bg-white min-w-[220px] cursor-pointer transition-shadow hover:shadow-xl`}
      role="article"
      aria-label={ariaLabel}
      aria-selected={selected}
      data-testid={`workflow-node-rules-category-${id}`}
      data-node-type="rules-category"
      data-configured={isConfigured}
      data-rule-count={ruleCount}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-green-500"
        aria-label="Connection point: input"
        data-testid={`workflow-handle-target-${id}`}
      />

      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
          <ListChecks className="w-5 h-5 text-green-600" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-gray-900">{data.label as string}</div>
          <div className="text-xs text-gray-500">Rules Processing</div>
        </div>
        {selected && (
          <Settings className="w-4 h-4 text-green-600" aria-label="Node is selected" />
        )}
      </div>

      <div className="text-xs text-gray-600 border-t pt-2">
        {isConfigured ? (
          <div className="space-y-1">
            <div className="text-xs text-green-600 font-medium">
              {ruleCount} rule{ruleCount === 1 ? '' : 's'} configured
            </div>
            <div className="text-xs text-gray-600">
              {rules.slice(0, 2).map((rule: any, i: number) => (
                <div key={i} className="truncate">• {rule.name}</div>
              ))}
              {ruleCount > 2 && (
                <div className="text-gray-500">+{ruleCount - 2} more</div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 italic">No rules configured</p>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-green-500"
        aria-label="Connection point: output"
        data-testid={`workflow-handle-source-${id}`}
      />
    </div>
  );
});

RulesCategoryNode.displayName = "RulesCategoryNode";
