import { UserManager, WebStorageStateStore, User } from 'oidc-client-ts';

interface FrontendConfig {
  authServerUrl: string;
  authClientId: string;
  audience: string;
  adminRole: string;
  searchEngine: string;
}

class AuthService {
  private userManager: UserManager | null = null;
  private config: FrontendConfig | null = null;
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    // Fetch frontend config from backend
    const config = await this.fetchConfig();
    this.config = config;

    const settings = {
      authority: config.authServerUrl,
      client_id: config.authClientId,
      redirect_uri: `${window.location.origin}/callback`,
      post_logout_redirect_uri: `${window.location.origin}/`,
      response_type: 'code',
      scope: 'openid profile email',
      userStore: new WebStorageStateStore({ store: window.localStorage }),
      automaticSilentRenew: true,
      silent_redirect_uri: `${window.location.origin}/silent-renew.html`,
      // Add audience parameter
      extraQueryParams: {
        audience: config.audience
      }
    };

    this.userManager = new UserManager(settings);
    this.initialized = true;

    // Setup events
    this.userManager.events.addUserLoaded((user: User) => {
      console.log('User loaded:', user.profile);
    });

    this.userManager.events.addUserUnloaded(() => {
      console.log('User unloaded');
    });

    this.userManager.events.addAccessTokenExpiring(() => {
      console.log('Access token expiring');
    });

    this.userManager.events.addAccessTokenExpired(() => {
      console.log('Access token expired');
      this.login();
    });

    this.userManager.events.addSilentRenewError((error: Error) => {
      console.error('Silent renew error:', error);
    });
  }

  async fetchConfig(): Promise<FrontendConfig> {
    const runtimeHost = window.location.hostname;
    const runtimeFullHost = window.location.host;
    const apiBase = runtimeHost === 'localhost'
      ? 'http://localhost:8080'
      : `https://${runtimeFullHost}`;
    
    const response = await fetch(`${apiBase}/api/present-now/v1/public/config`);
    if (!response.ok) {
      throw new Error('Failed to fetch frontend config');
    }
    return response.json();
  }

  async login() {
    await this.ensureInitialized();
    return this.userManager!.signinRedirect();
  }

  async handleCallback(): Promise<User> {
    await this.ensureInitialized();
    try {
      const user = await this.userManager!.signinRedirectCallback();
      return user;
    } catch (error) {
      console.error('Error handling callback:', error);
      throw error;
    }
  }

  async logout() {
    await this.ensureInitialized();
    return this.userManager!.signoutRedirect();
  }

  async getUser(): Promise<User | null> {
    await this.ensureInitialized();
    return this.userManager!.getUser();
  }

  async getAccessToken(): Promise<string | undefined> {
    const user = await this.getUser();
    return user?.access_token;
  }

  async isAuthenticated() {
    const user = await this.getUser();
    return user != null && !user.expired;
  }

  async hasRole(role: string): Promise<boolean> {
    const user = await this.getUser();
    if (!user) return false;
    
    const roles = user.profile.roles || user.profile.role || [];
    return Array.isArray(roles) ? roles.includes(role) : roles === role;
  }

  async isAdmin() {
    await this.ensureInitialized();
    if (!this.config) return false;
    return this.hasRole(this.config.adminRole);
  }

  async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  async renewToken() {
    await this.ensureInitialized();
    return this.userManager!.signinSilent();
  }

  async getSearchEngine(): Promise<string | undefined> {
    await this.ensureInitialized();
    return this.config?.searchEngine;
  }

  async getConfig(): Promise<FrontendConfig | null> {
    await this.ensureInitialized();
    return this.config;
  }
}

export default new AuthService();
