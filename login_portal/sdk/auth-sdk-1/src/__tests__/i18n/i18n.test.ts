/**
 * I18n System Tests
 * 
 * Comprehensive tests for the internationalization system including
 * translation retrieval, interpolation, and React context integration.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { renderHook, render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import {
    getTranslations,
    interpolate,
    getByPath,
    registerLocale,
    getAvailableLocales,
    I18nProvider,
    useI18n,
} from '../../i18n';
import { en } from '../../i18n/locales/en';
import { es } from '../../i18n/locales/es';
import { fr } from '../../i18n/locales/fr';
import type { Translations, LocaleCode } from '../../i18n/types';

describe('I18n System', () => {
    // Cleanup after each test to prevent DOM pollution
    afterEach(() => {
        cleanup();
    });

    describe('getTranslations', () => {
        it('should return English translations by default', () => {
            const translations = getTranslations();

            expect(translations.login.title).toBe('Sign In');
            expect(translations.login.signInButton).toBe('Sign In');
        });

        it('should return Spanish translations when requested', () => {
            const translations = getTranslations('es');

            expect(translations.login.title).toBe('Iniciar Sesión');
            expect(translations.login.signInButton).toBe('Iniciar Sesión');
        });

        it('should return French translations when requested', () => {
            const translations = getTranslations('fr');

            expect(translations.login.title).toBe('Connexion');
            expect(translations.login.signInButton).toBe('Se Connecter');
        });

        it('should fallback to English for unknown locale', () => {
            // Using type assertion to test invalid locale handling
            const unknownLocale = 'xx' as LocaleCode;
            const translations = getTranslations(unknownLocale);

            expect(translations.login.title).toBe('Sign In');
        });

        it('should merge custom translations with base locale', () => {
            // Note: This uses shallow merge, so we need to spread the full object
            const translations = getTranslations('en', {
                login: {
                    ...en.login,
                    title: 'Custom Title',
                },
            });

            expect(translations.login.title).toBe('Custom Title');
            // Verify other properties are preserved from the spread
            expect(translations.login.signInButton).toBe('Sign In');
        });

        it('should handle undefined custom translations', () => {
            const translations = getTranslations('en', undefined);

            expect(translations.login.title).toBe('Sign In');
        });

        it('should handle empty custom translations', () => {
            const translations = getTranslations('en', {});

            expect(translations.login.title).toBe('Sign In');
        });
    });

    describe('interpolate', () => {
        it('should replace placeholders with string values', () => {
            const result = interpolate('Welcome back, {name}', { name: 'John' });

            expect(result).toBe('Welcome back, John');
        });

        it('should replace multiple placeholders', () => {
            const result = interpolate('Digit {current} of {total}', { current: 3, total: 6 });

            expect(result).toBe('Digit 3 of 6');
        });

        it('should leave placeholder intact if value not provided', () => {
            const result = interpolate('Hello, {name}', {});

            expect(result).toBe('Hello, {name}');
        });

        it('should convert numeric values to strings', () => {
            const result = interpolate('You have {count} messages', { count: 5 });

            expect(result).toBe('You have 5 messages');
        });

        it('should handle template with no placeholders', () => {
            const result = interpolate('No placeholders here', { name: 'John' });

            expect(result).toBe('No placeholders here');
        });

        it('should handle empty template', () => {
            const result = interpolate('', { name: 'John' });

            expect(result).toBe('');
        });

        it('should handle adjacent placeholders', () => {
            const result = interpolate('{greeting}{name}', { greeting: 'Hello, ', name: 'World' });

            expect(result).toBe('Hello, World');
        });
    });

    describe('getByPath', () => {
        it('should get nested translation by dot path', () => {
            const result = getByPath(en, 'login.title');

            expect(result).toBe('Sign In');
        });

        it('should get deeply nested translation', () => {
            const result = getByPath(en, 'errors.generic');

            expect(result).toBe('Something went wrong. Please try again.');
        });

        it('should return path string if key not found', () => {
            const result = getByPath(en, 'nonexistent.path');

            expect(result).toBe('nonexistent.path');
        });

        it('should return path for partially matching key', () => {
            const result = getByPath(en, 'login.nonexistent');

            expect(result).toBe('login.nonexistent');
        });

        it('should handle single-level path', () => {
            // This will return the path since 'login' is an object, not a string
            const result = getByPath(en, 'login');

            expect(result).toBe('login');
        });
    });

    describe('registerLocale', () => {
        // Note: registerLocale mutates global state, so tests must be careful
        // about the order and isolation

        it('should register a new locale and retrieve it', () => {
            const customLocale: Translations = {
                ...en,
                login: {
                    ...en.login,
                    title: 'Custom Login Title',
                },
            };

            registerLocale('custom-test', customLocale);

            const translations = getTranslations('custom-test');
            expect(translations.login.title).toBe('Custom Login Title');
        });

        it('should override existing locale', () => {
            // Register a modified version of English
            const modifiedEn: Translations = {
                ...en,
                login: {
                    ...en.login,
                    title: 'Modified Sign In',
                },
            };

            registerLocale('en-modified', modifiedEn);

            const translations = getTranslations('en-modified');
            expect(translations.login.title).toBe('Modified Sign In');

            // Original English should be unchanged
            const originalEn = getTranslations('en');
            expect(originalEn.login.title).toBe('Sign In');
        });
    });

    describe('getAvailableLocales', () => {
        it('should return array containing built-in locales', () => {
            const locales = getAvailableLocales();

            expect(Array.isArray(locales)).toBe(true);
            expect(locales).toContain('en');
            expect(locales).toContain('es');
            expect(locales).toContain('fr');
        });

        it('should include dynamically registered locales', () => {
            const testLocaleName = 'test-locale-check';
            registerLocale(testLocaleName, en);

            const locales = getAvailableLocales();
            expect(locales).toContain(testLocaleName);
        });
    });

    describe('I18nProvider', () => {
        it('should provide translations to children', () => {
            const TestComponent = () => {
                const { t } = useI18n();
                return React.createElement('div', { 'data-testid': 'title' }, t.login.title);
            };

            render(
                React.createElement(I18nProvider, { locale: 'en', children: React.createElement(TestComponent) })
            );

            expect(screen.getByTestId('title')).toHaveTextContent('Sign In');
        });

        it('should provide correct locale-specific translations', () => {
            const TestComponent = () => {
                const { t, locale } = useI18n();
                return React.createElement('div', null,
                    React.createElement('span', { 'data-testid': 'locale' }, locale),
                    React.createElement('span', { 'data-testid': 'title' }, t.login.title)
                );
            };

            render(
                React.createElement(I18nProvider, { locale: 'es', children: React.createElement(TestComponent) })
            );

            expect(screen.getByTestId('locale')).toHaveTextContent('es');
            expect(screen.getByTestId('title')).toHaveTextContent('Iniciar Sesión');
        });

        it('should provide interpolate function in context', () => {
            const TestComponent = () => {
                const { t, interpolate: interp } = useI18n();
                return React.createElement(
                    'div',
                    { 'data-testid': 'interpolated' },
                    interp(t.success.welcomeBack, { name: 'John' })
                );
            };

            render(
                React.createElement(I18nProvider, { locale: 'en', children: React.createElement(TestComponent) })
            );

            expect(screen.getByTestId('interpolated')).toHaveTextContent('Welcome back, John');
        });

        it('should allow custom translations override', () => {
            const TestComponent = () => {
                const { t } = useI18n();
                return React.createElement('div', { 'data-testid': 'title' }, t.login.title);
            };

            render(
                React.createElement(I18nProvider, {
                    locale: 'en',
                    translations: {
                        login: {
                            ...en.login,
                            title: 'Custom Provider Title',
                        }
                    },
                    children: React.createElement(TestComponent)
                })
            );

            expect(screen.getByTestId('title')).toHaveTextContent('Custom Provider Title');
        });
    });

    describe('useI18n hook', () => {
        it('should return default English translations when used outside provider', () => {
            const { result } = renderHook(() => useI18n());

            expect(result.current.locale).toBe('en');
            expect(result.current.t.login.title).toBe('Sign In');
        });

        it('should return interpolate function', () => {
            const { result } = renderHook(() => useI18n());

            expect(typeof result.current.interpolate).toBe('function');
        });

        it('should have working interpolate function outside provider', () => {
            const { result } = renderHook(() => useI18n());

            const interpolated = result.current.interpolate('Hello, {name}!', { name: 'World' });
            expect(interpolated).toBe('Hello, World!');
        });
    });
});

describe('Translation Consistency', () => {
    // All supported locales for consistency checking
    const allLocales = { en, es, fr };

    it('should have same top-level keys in all locales', () => {
        const enKeys = Object.keys(en).sort();

        for (const [_localeName, locale] of Object.entries(allLocales)) {
            const localeKeys = Object.keys(locale).sort();
            expect(localeKeys).toEqual(enKeys);
        }
    });

    it('should have same nested keys in all locales', () => {
        const enKeys = Object.keys(en);

        for (const key of enKeys) {
            const enNested = Object.keys((en as Record<string, object>)[key]).sort();

            for (const [_localeName, locale] of Object.entries(allLocales)) {
                const localeNested = Object.keys((locale as Record<string, object>)[key]).sort();
                expect(localeNested).toEqual(enNested);
            }
        }
    });

    it('should have non-empty string values for all translation keys', () => {
        const checkValues = (obj: Record<string, unknown>, path = '') => {
            for (const [key, value] of Object.entries(obj)) {
                const currentPath = path ? `${path}.${key}` : key;

                if (typeof value === 'object' && value !== null) {
                    checkValues(value as Record<string, unknown>, currentPath);
                } else if (typeof value === 'string') {
                    expect(value.length).toBeGreaterThan(0);
                }
            }
        };

        for (const [_localeName, locale] of Object.entries(allLocales)) {
            checkValues(locale as Record<string, unknown>);
        }
    });
});
