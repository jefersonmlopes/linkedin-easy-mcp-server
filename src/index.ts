#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListResourcesRequestSchema,
    ListToolsRequestSchema,
    ReadResourceRequestSchema,
    Tool,
    Resource,
} from '@modelcontextprotocol/sdk/types.js';
import { LinkedInAPI, PostOptions } from './linkedin-api.js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

class LinkedInMCPServer {
    private server: Server;
    private linkedinAPI: LinkedInAPI;

    constructor() {
        this.server = new Server(
            {
                name: 'linkedin-easy-mcp-server',
                version: '2.0.0',
            },
            {
                capabilities: {
                    tools: {},
                    resources: {},
                },
            }
        );

        const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
        if (!accessToken) {
            throw new Error('LINKEDIN_ACCESS_TOKEN environment variable is required');
        }

        this.linkedinAPI = new LinkedInAPI(accessToken);
        this.setupHandlers();
    }

    private setupHandlers(): void {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'test_connection',
                        description: '✅ Test LinkedIn API connection and token validity (Always available)',
                        inputSchema: {
                            type: 'object',
                            properties: {},
                        },
                    },
                    {
                        name: 'get_profile',
                        description: '✅ Get your LinkedIn profile information using OpenID Connect (Always available)',
                        inputSchema: {
                            type: 'object',
                            properties: {},
                        },
                    },
                    {
                        name: 'validate_token',
                        description: '✅ Validate if your access token is still valid (Always available)',
                        inputSchema: {
                            type: 'object',
                            properties: {},
                        },
                    },
                    {
                        name: 'get_token_info',
                        description: '✅ Get detailed information about your access token and scopes (Always available)',
                        inputSchema: {
                            type: 'object',
                            properties: {},
                        },
                    },
                    {
                        name: 'create_text_post',
                        description: '⚠️ Create a simple text post on LinkedIn (Requires w_member_social scope)',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                text: {
                                    type: 'string',
                                    description: 'The text content of the post',
                                },
                                visibility: {
                                    type: 'string',
                                    enum: ['PUBLIC', 'CONNECTIONS'],
                                    description: 'Post visibility: PUBLIC or CONNECTIONS',
                                    default: 'PUBLIC',
                                },
                            },
                            required: ['text'],
                        },
                    },
                    {
                        name: 'create_article_post',
                        description: '⚠️ Create a post with an article/URL on LinkedIn (Requires w_member_social scope)',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                text: {
                                    type: 'string',
                                    description: 'The text content of the post',
                                },
                                articleUrl: {
                                    type: 'string',
                                    description: 'URL of the article to share',
                                },
                                articleTitle: {
                                    type: 'string',
                                    description: 'Title for the article (optional)',
                                },
                                articleDescription: {
                                    type: 'string',
                                    description: 'Description for the article (optional)',
                                },
                                visibility: {
                                    type: 'string',
                                    enum: ['PUBLIC', 'CONNECTIONS'],
                                    description: 'Post visibility: PUBLIC or CONNECTIONS',
                                    default: 'PUBLIC',
                                },
                            },
                            required: ['text', 'articleUrl'],
                        },
                    },
                    {
                        name: 'create_image_post',
                        description: '⚠️ Create a post with an image on LinkedIn (Requires w_member_social scope)',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                text: {
                                    type: 'string',
                                    description: 'The text content of the post',
                                },
                                imagePath: {
                                    type: 'string',
                                    description: 'Local file path to the image to upload',
                                },
                                imageTitle: {
                                    type: 'string',
                                    description: 'Title for the image (optional)',
                                },
                                imageDescription: {
                                    type: 'string',
                                    description: 'Description for the image (optional)',
                                },
                                visibility: {
                                    type: 'string',
                                    enum: ['PUBLIC', 'CONNECTIONS'],
                                    description: 'Post visibility: PUBLIC or CONNECTIONS',
                                    default: 'PUBLIC',
                                },
                            },
                            required: ['text', 'imagePath'],
                        },
                    },
                    // Restricted APIs - included for educational purposes
                    {
                        name: 'get_connections',
                        description: '❌ Get your LinkedIn connections (Requires special partnership approval)',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                start: {
                                    type: 'number',
                                    description: 'Starting index for pagination (default: 0)',
                                    default: 0,
                                },
                                count: {
                                    type: 'number',
                                    description: 'Number of connections to retrieve (default: 50, max: 500)',
                                    default: 50,
                                },
                            },
                        },
                    },
                    {
                        name: 'search_people',
                        description: '❌ Search for people on LinkedIn (Requires special partnership approval)',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                keywords: {
                                    type: 'string',
                                    description: 'Keywords to search for',
                                },
                                start: {
                                    type: 'number',
                                    description: 'Starting index for pagination (default: 0)',
                                    default: 0,
                                },
                                count: {
                                    type: 'number',
                                    description: 'Number of results to retrieve (default: 10)',
                                    default: 10,
                                },
                            },
                            required: ['keywords'],
                        },
                    },
                    {
                        name: 'get_company_info',
                        description: '❌ Get information about a LinkedIn company (Limited access)',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                companyId: {
                                    type: 'string',
                                    description: 'The LinkedIn company ID',
                                },
                            },
                            required: ['companyId'],
                        },
                    },
                    {
                        name: 'send_message',
                        description: '❌ Send a message to a LinkedIn connection (Requires special partnership approval)',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                recipientId: {
                                    type: 'string',
                                    description: 'The LinkedIn ID of the recipient',
                                },
                                message: {
                                    type: 'string',
                                    description: 'The message to send',
                                },
                            },
                            required: ['recipientId', 'message'],
                        },
                    },
                    {
                        name: 'like_post',
                        description: '❌ Like a LinkedIn post (Requires special partnership approval)',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                postId: {
                                    type: 'string',
                                    description: 'The LinkedIn post ID',
                                },
                            },
                            required: ['postId'],
                        },
                    },
                    {
                        name: 'comment_on_post',
                        description: '❌ Comment on a LinkedIn post (Requires special partnership approval)',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                postId: {
                                    type: 'string',
                                    description: 'The LinkedIn post ID',
                                },
                                comment: {
                                    type: 'string',
                                    description: 'The comment text',
                                },
                            },
                            required: ['postId', 'comment'],
                        },
                    },
                    {
                        name: 'get_profile_views',
                        description: '❌ Get analytics about your profile views (Requires special partnership approval)',
                        inputSchema: {
                            type: 'object',
                            properties: {},
                        },
                    },
                ],
            };
        });

        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            try {
                const { name, arguments: args } = request.params;

                if (!args) {
                    throw new Error('Arguments are required');
                }

                switch (name) {
                    case 'test_connection':
                        const connectionTestResult = await this.linkedinAPI.testConnection();
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(connectionTestResult, null, 2),
                                },
                            ],
                        };

                    case 'get_profile':
                        const profile = await this.linkedinAPI.getProfile();
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(profile, null, 2),
                                },
                            ],
                        };

                    case 'validate_token':
                        const isValid = await this.linkedinAPI.validateToken();
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        valid: isValid,
                                        message: isValid ? 'Token is valid ✅' : 'Token is invalid or expired ❌',
                                        timestamp: new Date().toISOString()
                                    }, null, 2),
                                },
                            ],
                        };

                    case 'get_token_info':
                        const tokenInfo = await this.linkedinAPI.getTokenInfo();
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(tokenInfo, null, 2),
                                },
                            ],
                        };

                    case 'create_text_post':
                        if (typeof args.text !== 'string') {
                            throw new Error('text must be a string');
                        }
                        const textPostOptions: PostOptions = {
                            text: args.text,
                            mediaType: 'NONE',
                            visibility: (args.visibility as 'PUBLIC' | 'CONNECTIONS') || 'PUBLIC'
                        };
                        const textPost = await this.linkedinAPI.createPost(textPostOptions);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Text post created successfully ✅\n${JSON.stringify(textPost, null, 2)}`,
                                },
                            ],
                        };

                    case 'create_article_post':
                        if (typeof args.text !== 'string' || typeof args.articleUrl !== 'string') {
                            throw new Error('text and articleUrl must be strings');
                        }
                        const articlePostOptions: PostOptions = {
                            text: args.text,
                            mediaType: 'ARTICLE',
                            mediaUrl: args.articleUrl,
                            mediaTitle: typeof args.articleTitle === 'string' ? args.articleTitle : undefined,
                            mediaDescription: typeof args.articleDescription === 'string' ? args.articleDescription : undefined,
                            visibility: (args.visibility as 'PUBLIC' | 'CONNECTIONS') || 'PUBLIC'
                        };
                        const articlePost = await this.linkedinAPI.createPost(articlePostOptions);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Article post created successfully ✅\n${JSON.stringify(articlePost, null, 2)}`,
                                },
                            ],
                        };

                    case 'create_image_post':
                        if (typeof args.text !== 'string' || typeof args.imagePath !== 'string') {
                            throw new Error('text and imagePath must be strings');
                        }
                        const imagePostOptions: PostOptions = {
                            text: args.text,
                            mediaType: 'IMAGE',
                            mediaFile: args.imagePath,
                            mediaTitle: typeof args.imageTitle === 'string' ? args.imageTitle : undefined,
                            mediaDescription: typeof args.imageDescription === 'string' ? args.imageDescription : undefined,
                            visibility: (args.visibility as 'PUBLIC' | 'CONNECTIONS') || 'PUBLIC'
                        };
                        const imagePost = await this.linkedinAPI.createPost(imagePostOptions);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Image post created successfully ✅\n${JSON.stringify(imagePost, null, 2)}`,
                                },
                            ],
                        };

                    // Legacy create_post for backward compatibility
                    case 'create_post':
                        if (typeof args.text !== 'string') {
                            throw new Error('text must be a string');
                        }
                        const legacyPost = await this.linkedinAPI.createPost(args.text);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Post created successfully ✅\n${JSON.stringify(legacyPost, null, 2)}`,
                                },
                            ],
                        };

                    case 'get_connections':
                        const start = typeof args.start === 'number' ? args.start : 0;
                        const count = typeof args.count === 'number' ? args.count : 50;
                        try {
                            const connections = await this.linkedinAPI.getConnections(start, count);
                            return {
                                content: [
                                    {
                                        type: 'text',
                                        text: JSON.stringify(connections, null, 2),
                                    },
                                ],
                            };
                        } catch (error: any) {
                            return {
                                content: [
                                    {
                                        type: 'text',
                                        text: `❌ ${error.message}\n\nNote: This feature requires special LinkedIn partnership approval and is not available for standard applications.`,
                                    },
                                ],
                            };
                        }

                    case 'search_people':
                        if (typeof args.keywords !== 'string') {
                            throw new Error('keywords must be a string');
                        }
                        try {
                            const searchStart = typeof args.start === 'number' ? args.start : 0;
                            const searchCount = typeof args.count === 'number' ? args.count : 10;
                            const people = await this.linkedinAPI.searchPeople(
                                args.keywords,
                                searchStart,
                                searchCount
                            );
                            return {
                                content: [
                                    {
                                        type: 'text',
                                        text: JSON.stringify(people, null, 2),
                                    },
                                ],
                            };
                        } catch (error: any) {
                            return {
                                content: [
                                    {
                                        type: 'text',
                                        text: `❌ ${error.message}\n\nNote: This feature requires special LinkedIn partnership approval and is not available for standard applications.`,
                                    },
                                ],
                            };
                        }

                    case 'get_company_info':
                        if (typeof args.companyId !== 'string') {
                            throw new Error('companyId must be a string');
                        }
                        try {
                            const company = await this.linkedinAPI.getCompanyInfo(args.companyId);
                            return {
                                content: [
                                    {
                                        type: 'text',
                                        text: JSON.stringify(company, null, 2),
                                    },
                                ],
                            };
                        } catch (error: any) {
                            return {
                                content: [
                                    {
                                        type: 'text',
                                        text: `❌ ${error.message}\n\nNote: This feature has limited access for standard applications.`,
                                    },
                                ],
                            };
                        }

                    case 'send_message':
                        if (typeof args.recipientId !== 'string' || typeof args.message !== 'string') {
                            throw new Error('recipientId and message must be strings');
                        }
                        try {
                            const messageResult = await this.linkedinAPI.sendMessage(
                                args.recipientId,
                                args.message
                            );
                            return {
                                content: [
                                    {
                                        type: 'text',
                                        text: `Message sent successfully ✅\n${JSON.stringify(messageResult, null, 2)}`,
                                    },
                                ],
                            };
                        } catch (error: any) {
                            return {
                                content: [
                                    {
                                        type: 'text',
                                        text: `❌ ${error.message}\n\nNote: This feature requires special LinkedIn partnership approval and is not available for standard applications.`,
                                    },
                                ],
                            };
                        }

                    case 'like_post':
                        if (typeof args.postId !== 'string') {
                            throw new Error('postId must be a string');
                        }
                        try {
                            const likeResult = await this.linkedinAPI.likePost(args.postId);
                            return {
                                content: [
                                    {
                                        type: 'text',
                                        text: `Post liked successfully ✅\n${JSON.stringify(likeResult, null, 2)}`,
                                    },
                                ],
                            };
                        } catch (error: any) {
                            return {
                                content: [
                                    {
                                        type: 'text',
                                        text: `❌ ${error.message}\n\nNote: This feature requires special LinkedIn partnership approval and is not available for standard applications.`,
                                    },
                                ],
                            };
                        }

                    case 'comment_on_post':
                        if (typeof args.postId !== 'string' || typeof args.comment !== 'string') {
                            throw new Error('postId and comment must be strings');
                        }
                        try {
                            const commentResult = await this.linkedinAPI.commentOnPost(
                                args.postId,
                                args.comment
                            );
                            return {
                                content: [
                                    {
                                        type: 'text',
                                        text: `Comment added successfully ✅\n${JSON.stringify(commentResult, null, 2)}`,
                                    },
                                ],
                            };
                        } catch (error: any) {
                            return {
                                content: [
                                    {
                                        type: 'text',
                                        text: `❌ ${error.message}\n\nNote: This feature requires special LinkedIn partnership approval and is not available for standard applications.`,
                                    },
                                ],
                            };
                        }

                    case 'get_profile_views':
                        try {
                            const views = await this.linkedinAPI.getProfileViews();
                            return {
                                content: [
                                    {
                                        type: 'text',
                                        text: JSON.stringify(views, null, 2),
                                    },
                                ],
                            };
                        } catch (error: any) {
                            return {
                                content: [
                                    {
                                        type: 'text',
                                        text: `❌ ${error.message}\n\nNote: This feature requires special LinkedIn partnership approval and is not available for standard applications.`,
                                    },
                                ],
                            };
                        }

                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            } catch (error) {
                throw new Error(`Tool execution failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        });

        // List available resources
        this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
            return {
                resources: [
                    {
                        uri: 'linkedin://profile',
                        mimeType: 'application/json',
                        name: 'Current LinkedIn Profile',
                        description: 'Your current LinkedIn profile information using OpenID Connect',
                    },
                    {
                        uri: 'linkedin://token-info',
                        mimeType: 'application/json',
                        name: 'Access Token Information',
                        description: 'Information about your LinkedIn access token and scopes',
                    },
                    {
                        uri: 'linkedin://api-status',
                        mimeType: 'application/json',
                        name: 'LinkedIn API Status',
                        description: 'Current status and connection test for LinkedIn API',
                    },
                    {
                        uri: 'linkedin://connections',
                        mimeType: 'application/json',
                        name: 'LinkedIn Connections (Restricted)',
                        description: 'Your LinkedIn connections list - Requires special partnership approval',
                    },
                ],
            };
        });

        // Handle resource reads
        this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
            const { uri } = request.params;

            try {
                switch (uri) {
                    case 'linkedin://profile':
                        const profile = await this.linkedinAPI.getProfile();
                        return {
                            contents: [
                                {
                                    uri,
                                    mimeType: 'application/json',
                                    text: JSON.stringify(profile, null, 2),
                                },
                            ],
                        };

                    case 'linkedin://token-info':
                        const tokenInfo = await this.linkedinAPI.getTokenInfo();
                        return {
                            contents: [
                                {
                                    uri,
                                    mimeType: 'application/json',
                                    text: JSON.stringify(tokenInfo, null, 2),
                                },
                            ],
                        };

                    case 'linkedin://api-status':
                        const apiStatus = await this.linkedinAPI.testConnection();
                        return {
                            contents: [
                                {
                                    uri,
                                    mimeType: 'application/json',
                                    text: JSON.stringify(apiStatus, null, 2),
                                },
                            ],
                        };

                    case 'linkedin://connections':
                        try {
                            const connections = await this.linkedinAPI.getConnections();
                            return {
                                contents: [
                                    {
                                        uri,
                                        mimeType: 'application/json',
                                        text: JSON.stringify(connections, null, 2),
                                    },
                                ],
                            };
                        } catch (error: any) {
                            return {
                                contents: [
                                    {
                                        uri,
                                        mimeType: 'application/json',
                                        text: JSON.stringify({
                                            error: error.message,
                                            note: 'This feature requires special LinkedIn partnership approval and is not available for standard applications.'
                                        }, null, 2),
                                    },
                                ],
                            };
                        }

                    default:
                        throw new Error(`Unknown resource: ${uri}`);
                }
            } catch (error) {
                throw new Error(`Resource read failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        });
    }

    async run(): Promise<void> {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('🚀 LinkedIn Easy MCP Server v2.0.0 running on stdio');
        console.error('📚 Enhanced with OpenID Connect and modern LinkedIn API support');
        console.error('ℹ️  Use test_connection to verify your setup');
    }
}

// Start the server
const server = new LinkedInMCPServer();
server.run().catch(console.error);
