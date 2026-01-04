/**
 * Internationalization System for Central Auth SDK
 * 
 * Provides translation support for all UI strings in the SDK.
 * 
 * @example
 * ```tsx
 * // Using default English
 * <AuthProvider config={config}>
 *   <App />
 * </AuthProvider>
 * 
 * // Using Spanish
 * <AuthProvider config={{ ...config, locale: { locale: 'es' } }}>
 *   <App />
 * </AuthProvider>
 * 
 * // Custom translations
 * <AuthProvider config={{ 
 *   ...config, 
 *   locale: { 
 *     locale: 'en',
 *     translations: {
 *       login: { title: 'Welcome!' }
 *     }
 *   }
 * }}>
 *   <App />
 * </AuthProvider>
 * ```
 */

import React, { createContext, useContext, useMemo } from 'react';
import type { Translations, LocaleCode } from './types';
import { en } from './locales/en';
import { es } from './locales/es';
import { fr } from './locales/fr';

// Re-export types
export type { Translations, LocaleCode, LocaleConfig } from './types';

/**
 * Built-in locale dictionary
 */
const locales: Record<string, Translations> = {
    en,
    es,
    fr,
};

/**
 * Register a new locale or override an existing one
 */
export function registerLocale(code: LocaleCode, translations: Translations): void {
    locales[code] = translations;
}

/**
 * Get available locale codes
 */
export function getAvailableLocales(): LocaleCode[] {
    return Object.keys(locales);
}

/**
 * Get translations for a locale
 */
export function getTranslations(
    locale: LocaleCode = 'en',
    customTranslations?: Partial<Translations>,
    fallbackLocale: LocaleCode = 'en'
): Translations {
    // Get base translations (locale or fallback)
    const baseTranslations = locales[locale] || locales[fallbackLocale] || en;

    // Merge with custom translations if provided
    if (customTranslations) {
        return { ...baseTranslations, ...customTranslations } as Translations;
    }

    return baseTranslations;
}

/**
 * Template string interpolation
 * Replaces {key} placeholders with values
 * 
 * @example
 * interpolate("Welcome back, {name}", { name: "John" })
 * // Returns: "Welcome back, John"
 */
export function interpolate(
    template: string,
    values: Record<string, string | number>
): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
        return values[key] !== undefined ? String(values[key]) : match;
    });
}

/**
 * I18n Context for React components
 */
interface I18nContextValue {
    locale: LocaleCode;
    t: Translations;
    interpolate: typeof interpolate;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * I18n Provider Props
 */
interface I18nProviderProps {
    locale?: LocaleCode;
    translations?: Partial<Translations>;
    fallbackLocale?: LocaleCode;
    children: React.ReactNode;
}

/**
 * I18n Provider component
 * Provides translations to child components
 */
export const I18nProvider: React.FC<I18nProviderProps> = ({
    locale = 'en',
    translations: customTranslations,
    fallbackLocale = 'en',
    children,
}) => {
    const value = useMemo<I18nContextValue>(() => ({
        locale,
        t: getTranslations(locale, customTranslations, fallbackLocale),
        interpolate,
    }), [locale, customTranslations, fallbackLocale]);

    return (
        <I18nContext.Provider value={value}>
            {children}
        </I18nContext.Provider>
    );
};

/**
 * Hook to access translations
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { t, interpolate } = useI18n();
 *   
 *   return (
 *     <div>
 *       <h1>{t.login.title}</h1>
 *       <p>{interpolate(t.success.welcomeBack, { name: 'John' })}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useI18n(): I18nContextValue {
    const context = useContext(I18nContext);

    if (!context) {
        // Return default English if not within provider
        return {
            locale: 'en',
            t: en,
            interpolate,
        };
    }

    return context;
}

/**
 * Get a translation value by dot-notation path
 * Useful for dynamic key access
 * 
 * @example
 * getByPath(translations, 'login.title') // Returns "Sign In"
 */
export function getByPath(translations: Translations, path: string): string {
    const keys = path.split('.');
    let current: unknown = translations;

    for (const key of keys) {
        if (current && typeof current === 'object' && key in current) {
            current = (current as Record<string, unknown>)[key];
        } else {
            return path; // Return path itself if not found
        }
    }

    return typeof current === 'string' ? current : path;
}

// Default export for convenience
export default {
    en,
    es,
    fr,
    registerLocale,
    getAvailableLocales,
    getTranslations,
    interpolate,
    getByPath,
    I18nProvider,
    useI18n,
};
