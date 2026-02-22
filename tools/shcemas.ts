import { z } from 'zod';
import { tool } from 'ai';

export const FILTER_RESULT_LIMIT = 5


export const tools = {
    search_logs: tool({
        description: `search for logsSearch logs by identifiers`,
        inputSchema: z.object({
            identifier_type: z.enum(['request_id', 'user_id']).describe('Type of identifier'),
            identifier_value: z.string().describe('Value of identifier'),
        })
    }),

    check_recent_changes: tool({
        description: 'Returns a filtered subset of recent changes based on criteria. Only the first ${FILTER_RESULT_LIMIT} results are added to the memory, and the rest are truncated to save context. If relevant, let the user know that the results have been truncated.',
        inputSchema: z.object({
            groupBy: z.enum(['time', 'service', 'level', 'msg']).describe('How to group: time, service, level, or msg'),
        }),
    }),

    alert_teams: tool({
        description: 'Alerts teams about an issue. All filter parameters are optional',
        inputSchema: z.object({
            teams: z.array(z.string()).describe('Teams to alert'),
            message: z.string().describe('Message to send to teams'),
        }),
    }),

    create_ticket: tool({
        description: 'Creates a ticket about an issue. All filter parameters are optional',
        inputSchema: z.object({
            teams: z.array(z.string()).describe('Teams to alert'),
            message: z.string().describe('Message to send to teams'),
        }),
    }),
};
