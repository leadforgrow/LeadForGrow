/**
 * Sequence automation service layer — re-exports engine for API/workers.
 */
export { sequenceEngine, default } from '@/lib/sequences/engine';
export { executeNode, getOutgoingEdges, findStartNode, findTriggerNode } from '@/lib/sequences/executor';
export { syncSequenceRule, disableSequenceRule, deleteSequenceRule } from '@/lib/sequences/ruleSync';
