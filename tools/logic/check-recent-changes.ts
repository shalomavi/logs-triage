import { LogEntry } from "../../agent/types";

export const checkRecentChanges = async (logs: LogEntry[], args: any) => {
    return {
        logs: logs.filter(log => log.msg.includes(args.query)),
    };
};