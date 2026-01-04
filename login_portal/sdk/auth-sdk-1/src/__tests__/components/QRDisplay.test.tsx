/**
 * QRDisplay Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { QRDisplay } from '../../components/QRDisplay';
import { I18nProvider } from '../../i18n';

// Wrapper component to provide i18n context
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <I18nProvider locale="en">
        {children}
    </I18nProvider>
);

describe('QRDisplay Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('rendering', () => {
        it('should render QR code image', () => {
            render(
                <QRDisplay
                    qrImage="data:image/png;base64,test"
                    expiresIn={120}
                />,
                { wrapper: TestWrapper }
            );

            const img = screen.getByAltText('Login QR Code');
            expect(img).toBeInTheDocument();
            expect(img).toHaveAttribute('src', 'data:image/png;base64,test');
        });

        it('should render countdown timer', () => {
            render(
                <QRDisplay
                    qrImage="data:image/png;base64,test"
                    expiresIn={120}
                />,
                { wrapper: TestWrapper }
            );

            expect(screen.getByText('2:00')).toBeInTheDocument();
        });

        it('should render instructions text', () => {
            render(
                <QRDisplay
                    qrImage="data:image/png;base64,test"
                    expiresIn={120}
                />,
                { wrapper: TestWrapper }
            );

            expect(screen.getByText(/Open your mobile app/i)).toBeInTheDocument();
        });
    });

    describe('timer formatting', () => {
        it('should format single-digit seconds with leading zero', () => {
            render(
                <QRDisplay
                    qrImage="data:image/png;base64,test"
                    expiresIn={65}
                />,
                { wrapper: TestWrapper }
            );

            expect(screen.getByText('1:05')).toBeInTheDocument();
        });

        it('should format zero minutes correctly', () => {
            render(
                <QRDisplay
                    qrImage="data:image/png;base64,test"
                    expiresIn={45}
                />,
                { wrapper: TestWrapper }
            );

            expect(screen.getByText('0:45')).toBeInTheDocument();
        });

        it('should format zero seconds correctly', () => {
            render(
                <QRDisplay
                    qrImage="data:image/png;base64,test"
                    expiresIn={60}
                />,
                { wrapper: TestWrapper }
            );

            expect(screen.getByText('1:00')).toBeInTheDocument();
        });
    });

    describe('timer color', () => {
        it('should show gray color when time > 30 seconds', () => {
            render(
                <QRDisplay
                    qrImage="data:image/png;base64,test"
                    expiresIn={60}
                />,
                { wrapper: TestWrapper }
            );

            const timerContainer = screen.getByText('1:00').closest('div');
            expect(timerContainer).toHaveClass('text-gray-600');
        });

        it('should show orange color when time <= 30 seconds', () => {
            render(
                <QRDisplay
                    qrImage="data:image/png;base64,test"
                    expiresIn={25}
                />,
                { wrapper: TestWrapper }
            );

            const timerContainer = screen.getByText('0:25').closest('div');
            expect(timerContainer).toHaveClass('text-orange-500');
        });

        it('should show red color when time <= 15 seconds', () => {
            render(
                <QRDisplay
                    qrImage="data:image/png;base64,test"
                    expiresIn={10}
                />,
                { wrapper: TestWrapper }
            );

            const timerContainer = screen.getByText('0:10').closest('div');
            expect(timerContainer).toHaveClass('text-red-600');
        });
    });

    describe('expiration', () => {
        it('should call onExpired when expiresIn reaches 0', () => {
            const onExpired = vi.fn();

            render(
                <QRDisplay
                    qrImage="data:image/png;base64,test"
                    expiresIn={0}
                    onExpired={onExpired}
                />,
                { wrapper: TestWrapper }
            );

            expect(onExpired).toHaveBeenCalled();
        });

        it('should not call onExpired when time remains', () => {
            const onExpired = vi.fn();

            render(
                <QRDisplay
                    qrImage="data:image/png;base64,test"
                    expiresIn={60}
                    onExpired={onExpired}
                />,
                { wrapper: TestWrapper }
            );

            expect(onExpired).not.toHaveBeenCalled();
        });
    });

    describe('custom className', () => {
        it('should apply custom className', () => {
            const { container } = render(
                <QRDisplay
                    qrImage="data:image/png;base64,test"
                    expiresIn={120}
                    className="custom-class"
                />,
                { wrapper: TestWrapper }
            );

            expect(container.firstChild).toHaveClass('custom-class');
        });
    });
});
