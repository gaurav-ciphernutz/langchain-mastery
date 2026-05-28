export interface StreamEnvelope<TData = unknown> {
  event: string;
  meta: {
    requestId: string;
    traceId: string;
    threadId: string;
    workflowName?: string;
  };
  data: TData;
}

export function formatServerSentEvent<TData>(envelope: StreamEnvelope<TData>) {
  return `event: ${envelope.event}\ndata: ${JSON.stringify(envelope)}\n\n`;
}
