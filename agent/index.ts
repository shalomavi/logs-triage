import { LogEntry } from './types';
import { deepDelete, sleep } from '../utils/general'; // You will probably want to use these
import chalk from 'chalk'; // This is just for fun, don't worry about it
import { generateText, ModelMessage, TypedToolCall } from 'ai';
import { google } from '@ai-sdk/google';
import { toolFunctions } from '../tools/registry';
import { FILTER_RESULT_LIMIT, tools } from '../tools/shcemas';
import { INITIAL_SYSTEM_PROMPT } from './prompt';

const MAX_STEPS = 3;

export class LogTriageAgent {
  private logsFileNumber: number;
  private logs: LogEntry[];
  private agentMemory: ModelMessage[];

  constructor(logsFileNumber: number, logs: LogEntry[]) {
    this.logsFileNumber = logsFileNumber;
    this.logs = logs;
    this.agentMemory = [
      {
        role: 'system',
        content: INITIAL_SYSTEM_PROMPT,
      }
    ];

  }

  private addToMemory(toolCallId: string, toolName: string, result: any): void {
    let truncatedResult = result;
    if (toolName === 'search_logs') {
      truncatedResult = {
        filteredCount: result.metadata.totalMatching,
        firstFew: result.logs.slice(0, FILTER_RESULT_LIMIT),
        note: "Note: this result has been truncated to save context.",
      };
    }

    this.agentMemory.push({
      role: 'tool',
      content: [
        {
          type: 'tool-result',
          toolCallId,
          toolName,
          output: { type: 'json' as const, value: JSON.stringify(truncatedResult) },
        },
      ],
    });
  }

  private async handleToolCall(toolCall: TypedToolCall<typeof tools>): Promise<void> {
    const toolFn = toolFunctions[toolCall.toolName];

    if (!toolFn) {
      this.addToMemory(
        toolCall.toolCallId,
        toolCall.toolName,
        { error: `Unknown tool: ${toolCall.toolName}` }
      );
      return;
    }

    try {
      console.log('Calling tool', toolCall.toolName, 'with input', toolCall.input);
      const toolResult = await toolFn(this.logs, toolCall.input);
      this.addToMemory(toolCall.toolCallId, toolCall.toolName, toolResult);
    } catch (error) {
      this.addToMemory(
        toolCall.toolCallId,
        toolCall.toolName,
        { error: error instanceof Error ? error.message : 'Tool execution failed' }
      );
    }
  }

  async run(): Promise<string> {

    // this.agentMemory.push({
    //   role: 'user',
    //   content: "",
    // });

    let step = 0;
    while (step < MAX_STEPS) {
      const result = await generateText({
        model: google('gemini-2.5-flash'),
        messages: this.agentMemory,
        tools,
        temperature: 0.1,
      });

      deepDelete(result.response.messages, 'providerOptions'); // Remove providerOptions to avoid cluttering the memory with the thoughtSignature
      this.agentMemory.push(...result.response.messages);

      if (result.finishReason === 'tool-calls') {
        for (const toolCall of result.toolCalls) {
          await this.handleToolCall(toolCall);
        }
      } else {
        return `${chalk.green('Agent completed the task:')}\n${result.text}`;
      }

      step++;
      await sleep(1_000);
    }


    return 'Agent reached maximum steps without completing the task.';
  }
}
