import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Webhook, Mail, MessageSquare, Upload, Settings } from "lucide-react";

const iconMap = {
  webhook: Webhook,
  email: Mail,
  slack: MessageSquare,
};

export const OutputNode = memo(({ data, selected, id }: NodeProps) => {
  const Icon = iconMap[data.outputType as keyof typeof iconMap] || Upload;
  const config = data.config as any;
  const isConfigured = config && (config.outputType || config.webhookUrl || config.emailTo || config.slackWebhook);

  const ariaLabel = `Output node: ${data.label as string}. ${
    isConfigured
      ? `Configured as ${config.outputType || 'output action'}`
      : 'Not configured'
  }`;

  return (
    <div
      className={`px-6 py-4 shadow-lg rounded-lg border-2 ${selected ? 'border-orange-600 ring-2 ring-orange-300' : 'border-orange-500'} bg-white min-w-[200px] cursor-pointer transition-shadow hover:shadow-xl`}
      role="article"
      aria-label={ariaLabel}
      aria-selected={selected}
      data-testid={`workflow-node-output-${id}`}
      data-node-type="output"
      data-configured={isConfigured}
      data-output-type={config?.outputType || 'none'}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-orange-500"
        aria-label="Connection point: input"
        data-testid={`workflow-handle-target-${id}`}
      />

      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100">
          <Icon className="w-5 h-5 text-orange-600" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-gray-900">{data.label as string}</div>
          <div className="text-xs text-gray-500">Output Action</div>
        </div>
        {selected && (
          <Settings className="w-4 h-4 text-orange-600" aria-label="Node is selected" />
        )}
      </div>

      <div>
        {isConfigured ? (
          <div className="space-y-1">
            {config.outputType && (
              <div className="text-xs text-orange-600 font-medium capitalize">
                Type: {config.outputType}
              </div>
            )}
            {config.webhookUrl && (
              <div className="text-xs text-gray-600 truncate">
                {config.webhookUrl.substring(0, 30)}...
              </div>
            )}
            {config.emailTo && (
              <div className="text-xs text-gray-600 truncate">
                To: {config.emailTo}
              </div>
            )}
            {config.slackChannel && (
              <div className="text-xs text-gray-600 truncate">
                Channel: {config.slackChannel}
              </div>
            )}
          </div>
        ) : (
          <div className="inline-block px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800 font-medium">
            Not configured
          </div>
        )}
      </div>
    </div>
  );
});

OutputNode.displayName = "OutputNode";
