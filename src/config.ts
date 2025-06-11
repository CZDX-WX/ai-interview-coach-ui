// src/config.ts

/**
 * 后端服务的根URL，用于拼接文件路径等。
 * 从 .env 文件读取，并提供一个备用值。
 * 示例: "http://localhost:9090/interview-agent"
 */
export const API_ROOT_URL = import.meta.env.VITE_API_ROOT_URL || 'http://localhost:9090/interview-agent';

/**
 * 后端 API 的基础URL，专门给 Axios (apiClient) 使用。
 * 它会在根URL后自动附加 /api。
 * 示例: "http://localhost:9090/interview-agent/api"
 */
export const API_BASE_URL = `${API_ROOT_URL}/api`;


// 您可以在此添加其他全局配置
export const APP_TITLE = import.meta.env.VITE_APP_TITLE || 'AI Interview Coach';