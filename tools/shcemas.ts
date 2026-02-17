import { z } from 'zod';
import { tool } from 'ai';

export const FILTER_RESULT_LIMIT = 5

// const filterSchema = {
//     startDate: z.string().optional().describe('Start date in YYYY-MM-DD format'),
//     endDate: z.string().optional().describe('End date in YYYY-MM-DD format'),
//     category: z.enum(['utilities', 'health', 'subscriptions', 'transportation', 'shopping', 'dining', 'groceries', 'entertainment']).optional().describe('Category to filter by'),
//     vendor: z.string().optional().describe('Vendor/merchant name to filter by'),
//     minAmount: z.number().optional().describe('Minimum expense amount'),
//     maxAmount: z.number().optional().describe('Maximum expense amount'),

//     excludeAnomalies: z.boolean().optional().describe('If true, exclude statistical outliers from results'),
//     anomalyThreshold: z.number().optional().describe('Standard deviation threshold for anomaly detection (default 2)'),
// };

export const tools = {
    search_logs: tool({
        description: `Returns a filtered subset of logs based on criteria. Only the first ${FILTER_RESULT_LIMIT} results are added to the memory, and the rest are truncated to save context. If relevant, let the user know that the results have been truncated.`,
        inputSchema: z.object({
            groupBy: z.enum(['time', 'service', 'level', 'msg']).describe('How to group: time, service, level, or msg'),
            // ...filterSchema
        })
    }),

    check_recent_changes: tool({
        description: 'Returns a filtered subset of recent changes based on criteria. Only the first ${FILTER_RESULT_LIMIT} results are added to the memory, and the rest are truncated to save context. If relevant, let the user know that the results have been truncated.',
        inputSchema: z.object({
            groupBy: z.enum(['time', 'service', 'level', 'msg']).describe('How to group: time, service, level, or msg'),
            // ...filterSchema
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
