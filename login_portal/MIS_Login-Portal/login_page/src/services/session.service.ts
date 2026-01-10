import { Injectable, signal, computed } from '@angular/core';

interface UserInfo {
    user_id: number;
    username: string;
    full_name: string;
    email: string;
}

const TOKEN_KEY = 'mis_session_token';
const USER_KEY = 'mis_user_info';
const EXPIRES_KEY = 'mis_session_expires';

@Injectable({
    providedIn: 'root'
})
export class SessionService {
    private _token = signal<string | null>(this.loadToken());
    private _user = signal<UserInfo | null>(this.loadUser());
    private _expiresAt = signal<Date | null>(this.loadExpiry());

    isLoggedIn = computed(() => {
        const token = this._token();
        const expires = this._expiresAt();

        if (!token) return false;
        if (expires && new Date() > expires) {
            this.clearSession();
            return false;
        }
        return true;
    });

    currentUser = this._user.asReadonly();
    token = this._token.asReadonly();

    constructor() {
        // Check session validity on startup
        this.validateSession();
    }

    setSession(token: string, user: UserInfo, expiresInSeconds: number = 1800): void {
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + expiresInSeconds);

        // Store in localStorage
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        localStorage.setItem(EXPIRES_KEY, expiresAt.toISOString());

        // Update signals
        this._token.set(token);
        this._user.set(user);
        this._expiresAt.set(expiresAt);
    }

    getToken(): string | null {
        return this._token();
    }

    clearSession(): void {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(EXPIRES_KEY);

        this._token.set(null);
        this._user.set(null);
        this._expiresAt.set(null);
    }

    private loadToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    }

    private loadUser(): UserInfo | null {
        const data = localStorage.getItem(USER_KEY);
        return data ? JSON.parse(data) : null;
    }

    private loadExpiry(): Date | null {
        const data = localStorage.getItem(EXPIRES_KEY);
        return data ? new Date(data) : null;
    }

    private validateSession(): void {
        const expires = this._expiresAt();
        if (expires && new Date() > expires) {
            this.clearSession();
        }
    }
}
