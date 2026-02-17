import { LogEntry } from '../agent/types';
import { searchLogs } from './logic/search-logs';
import { alertTeams } from './logic/alert-teams';
import { createTicket } from './logic/create-ticket';
import { checkRecentChanges } from './logic/check-recent-changes';

type ToolFunction = (logs: LogEntry[], args: any) => Promise<unknown> | unknown;

export const toolFunctions: Record<string, ToolFunction> = {
    search_logs: searchLogs,
    alert_teams: alertTeams,
    create_ticket: createTicket,
    check_recent_changes: checkRecentChanges,
};