import client from './client';

export interface MCPTool {
  name: string;
  description: string;
  input_schema: any;
}

export interface ToolCallResult {
  tool: string;
  result: any;
  error?: string;
}

export interface ChatResponse {
  response: string;
  tool_calls: ToolCallResult[];
}

export const saveToken = async (token: string) => {
  return await client.post('/mcdonalds/token', { token });
};

export const getTokenStatus = async () => {
  const response = await client.get('/mcdonalds/token');
  return response.data;
};

export const listTools = async (): Promise<{ tools: MCPTool[] }> => {
  const response = await client.get('/mcdonalds/tools');
  return response.data;
};

export const callTool = async (toolName: string, args: any) => {
  const response = await client.post('/mcdonalds/call', { tool_name: toolName, arguments: args });
  return response.data;
};

export const chatWithMCP = async (message: string): Promise<ChatResponse> => {
  const response = await client.post('/mcdonalds/chat', { message });
  return response.data;
};
