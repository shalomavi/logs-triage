import { LogEntry } from '../agent/types';
import { searchLogs } from './logic/search-logs';

type ToolFunction = (logs: LogEntry[], args: any) => Promise<unknown> | unknown;

export const toolFunctions: Record<string, ToolFunction> = {
    search_logs: searchLogs,
};