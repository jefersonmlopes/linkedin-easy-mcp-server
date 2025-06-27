import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import fs from 'fs';

export interface LinkedInProfile {
    sub: string;
    name: string;
    given_name: string;
    family_name: string;
    picture?: string;
    locale?: string;
    email?: string;
    email_verified?: boolean;
}

export interface LinkedInPost {
    id: string;
    author: string;
    text: string;
    createdAt: string;
    likeCount?: number;
    commentCount?: number;
    shareCount?: number;
}

export interface LinkedInConnection {
    id: string;
    firstName: string;
    lastName: string;
    headline?: string;
    profilePicture?: string;
}

export interface ShareMedia {
    status: 'READY';
    description?: { text: string };
    media?: string; // For images/videos
    originalUrl?: string; // For articles
    title?: { text: string };
}

export interface PostOptions {
    text: string;
    mediaType?: 'NONE' | 'ARTICLE' | 'IMAGE' | 'VIDEO';
    mediaUrl?: string; // URL for articles
    mediaFile?: string; // File path for images/videos
    mediaTitle?: string;
    mediaDescription?: string;
    visibility?: 'PUBLIC' | 'CONNECTIONS';
}

export class LinkedInAPI {
    private client: AxiosInstance;
    private accessToken: string;
    private readonly API_VERSION = '202404'; // Latest API version

    constructor(accessToken: string) {
        this.accessToken = accessToken;
        this.client = axios.create({
            baseURL: 'https://api.linkedin.com/v2',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'LinkedIn-Version': this.API_VERSION,
                'X-Restli-Protocol-Version': '2.0.0'
            }
        });
    }

    async getProfile(): Promise<LinkedInProfile> {
        try {
            // Use the OpenID Connect userinfo endpoint
            const response = await this.client.get('/userinfo');
            const data = response.data;

            return {
                sub: data.sub || '',
                name: data.name || '',
                given_name: data.given_name || '',
                family_name: data.family_name || '',
                picture: data.picture,
                locale: data.locale,
                email: data.email,
                email_verified: data.email_verified
            };
        } catch (error: any) {
            console.error('LinkedIn API Error:', error.response?.data || error.message);
            throw new Error(`Failed to get profile: ${error.response?.data?.message || error.message}`);
        }
    }

    async createPost(text: string): Promise<any>;
    async createPost(options: PostOptions): Promise<any>;
    async createPost(textOrOptions: string | PostOptions): Promise<any> {
        try {
            // Get user info first to get the person URN
            const profile = await this.getProfile();

            // Handle both string and options parameter
            const options: PostOptions = typeof textOrOptions === 'string'
                ? { text: textOrOptions, mediaType: 'NONE', visibility: 'PUBLIC' }
                : { mediaType: 'NONE', visibility: 'PUBLIC', ...textOrOptions };

            let media: ShareMedia[] = [];

            // Handle different media types
            if (options.mediaType === 'ARTICLE' && options.mediaUrl) {
                media = [{
                    status: 'READY',
                    originalUrl: options.mediaUrl,
                    title: options.mediaTitle ? { text: options.mediaTitle } : undefined,
                    description: options.mediaDescription ? { text: options.mediaDescription } : undefined
                }];
            } else if (options.mediaType === 'IMAGE' && options.mediaFile) {
                // First upload the image
                const assetId = await this.uploadImage(options.mediaFile);
                media = [{
                    status: 'READY',
                    media: assetId,
                    title: options.mediaTitle ? { text: options.mediaTitle } : undefined,
                    description: options.mediaDescription ? { text: options.mediaDescription } : undefined
                }];
            }

            const postData = {
                author: `urn:li:person:${profile.sub}`,
                lifecycleState: 'PUBLISHED',
                specificContent: {
                    'com.linkedin.ugc.ShareContent': {
                        shareCommentary: {
                            text: options.text
                        },
                        shareMediaCategory: options.mediaType || 'NONE',
                        ...(media.length > 0 && { media })
                    }
                },
                visibility: {
                    'com.linkedin.ugc.MemberNetworkVisibility': options.visibility || 'PUBLIC'
                }
            };

            const response = await this.client.post('/ugcPosts', postData);
            return {
                success: true,
                postId: response.headers['x-restli-id'],
                data: response.data
            };
        } catch (error: any) {
            console.error('LinkedIn API Error:', error.response?.data || error.message);
            throw new Error(`Failed to create post: ${error.response?.data?.message || error.message}`);
        }
    }

    async uploadImage(filePath: string): Promise<string> {
        try {
            const profile = await this.getProfile();

            // Step 1: Register upload
            const registerResponse = await this.client.post('/assets?action=registerUpload', {
                registerUploadRequest: {
                    recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
                    owner: `urn:li:person:${profile.sub}`,
                    serviceRelationships: [{
                        relationshipType: 'OWNER',
                        identifier: 'urn:li:userGeneratedContent'
                    }]
                }
            });

            const { uploadUrl, asset } = registerResponse.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'];
            const assetId = registerResponse.data.value.asset;

            // Step 2: Upload binary file
            const fileData = fs.readFileSync(filePath);
            await axios.put(uploadUrl, fileData, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/octet-stream'
                }
            });

            return assetId;
        } catch (error: any) {
            console.error('LinkedIn Upload Error:', error.response?.data || error.message);
            throw new Error(`Failed to upload image: ${error.response?.data?.message || error.message}`);
        }
    }

    async getConnections(start: number = 0, count: number = 50): Promise<LinkedInConnection[]> {
        try {
            // Note: Connections API is restricted and requires special approval
            console.warn('❌ Connections API requires special LinkedIn partnership approval');

            // This is a placeholder - actual connections API requires elevated permissions
            throw new Error('Connections API requires elevated LinkedIn API permissions and special approval from LinkedIn. This feature is not available for standard applications.');
        } catch (error: any) {
            console.error('LinkedIn API Error:', error.response?.data || error.message);
            throw new Error(`Failed to get connections: ${error.response?.data?.message || error.message}`);
        }
    }

    async searchPeople(keywords: string, start: number = 0, count: number = 10): Promise<any[]> {
        try {
            console.warn('❌ People search API is restricted for most applications');
            throw new Error('People search requires elevated LinkedIn API permissions and special approval from LinkedIn. This feature is not available for standard applications.');
        } catch (error: any) {
            console.error('LinkedIn API Error:', error.response?.data || error.message);
            throw new Error(`Failed to search people: ${error.response?.data?.message || error.message}`);
        }
    }

    async getCompanyInfo(companyId: string): Promise<any> {
        try {
            console.warn('❌ Company API access is limited for most applications');
            throw new Error('Company API requires elevated LinkedIn API permissions. This feature may not be available for standard applications.');
        } catch (error: any) {
            console.error('LinkedIn API Error:', error.response?.data || error.message);
            throw new Error(`Failed to get company info: ${error.response?.data?.message || error.message}`);
        }
    }

    async sendMessage(recipientId: string, message: string): Promise<any> {
        try {
            console.warn('❌ Messaging API requires special LinkedIn partnership approval');
            throw new Error('Messaging API requires elevated LinkedIn API permissions and special approval from LinkedIn. This feature is not available for standard applications.');
        } catch (error: any) {
            console.error('LinkedIn API Error:', error.response?.data || error.message);
            throw new Error(`Failed to send message: ${error.response?.data?.message || error.message}`);
        }
    }

    async likePost(postId: string): Promise<any> {
        try {
            console.warn('❌ Social actions (likes) API requires special LinkedIn permissions');
            throw new Error('Social actions API requires elevated LinkedIn API permissions and special approval from LinkedIn. This feature is not available for standard applications.');
        } catch (error: any) {
            console.error('LinkedIn API Error:', error.response?.data || error.message);
            throw new Error(`Failed to like post: ${error.response?.data?.message || error.message}`);
        }
    }

    async commentOnPost(postId: string, comment: string): Promise<any> {
        try {
            console.warn('❌ Comments API requires special LinkedIn permissions');
            throw new Error('Comments API requires elevated LinkedIn API permissions and special approval from LinkedIn. This feature is not available for standard applications.');
        } catch (error: any) {
            console.error('LinkedIn API Error:', error.response?.data || error.message);
            throw new Error(`Failed to comment on post: ${error.response?.data?.message || error.message}`);
        }
    }

    async getProfileViews(): Promise<any> {
        try {
            console.warn('❌ Analytics API requires special LinkedIn partnership approval');
            throw new Error('Analytics API requires elevated LinkedIn API permissions and special approval from LinkedIn. This feature is not available for standard applications.');
        } catch (error: any) {
            console.error('LinkedIn API Error:', error.response?.data || error.message);
            throw new Error(`Failed to get profile views: ${error.response?.data?.message || error.message}`);
        }
    }

    async testConnection(): Promise<any> {
        try {
            // Test basic API connectivity using OpenID Connect userinfo endpoint
            const response = await this.client.get('/userinfo');

            return {
                success: true,
                message: 'LinkedIn API connection successful ✅',
                timestamp: new Date().toISOString(),
                api_version: this.API_VERSION,
                user: {
                    sub: response.data.sub,
                    name: response.data.name,
                    email: response.data.email || 'Not provided'
                },
                available_scopes: this.getAvailableScopes(response.data),
                rate_limits: {
                    daily_limit: 'Varies by endpoint',
                    note: 'Rate limits are enforced per member and per application'
                }
            };
        } catch (error: any) {
            console.error('LinkedIn API Connection Test Failed:', error.response?.data || error.message);
            return {
                success: false,
                message: `Connection failed ❌: ${error.response?.data?.message || error.message}`,
                timestamp: new Date().toISOString(),
                status: error.response?.status,
                error_details: error.response?.data,
                troubleshooting: {
                    common_issues: [
                        'Token expired (LinkedIn tokens expire in 60 days)',
                        'Invalid or revoked access token',
                        'Missing required scopes (openid, profile, email)',
                        'Application not approved for requested permissions'
                    ],
                    solutions: [
                        'Generate a new access token',
                        'Verify scopes in LinkedIn Developer Portal',
                        'Check if application has required permissions',
                        'Review LinkedIn API Terms of Use compliance'
                    ]
                }
            };
        }
    }

    private getAvailableScopes(userData: any): string[] {
        const scopes = ['openid']; // Always available with OpenID Connect

        if (userData.name || userData.given_name) scopes.push('profile');
        if (userData.email) scopes.push('email');

        return scopes;
    }

    // New utility methods for better error handling and token management
    async validateToken(): Promise<boolean> {
        try {
            await this.client.get('/userinfo');
            return true;
        } catch {
            return false;
        }
    }

    async getTokenInfo(): Promise<any> {
        try {
            const response = await this.client.get('/userinfo');
            return {
                valid: true,
                user_id: response.data.sub,
                scopes_detected: this.getAvailableScopes(response.data),
                last_verified: new Date().toISOString()
            };
        } catch (error: any) {
            return {
                valid: false,
                error: error.response?.data?.message || error.message,
                status_code: error.response?.status
            };
        }
    }
}
