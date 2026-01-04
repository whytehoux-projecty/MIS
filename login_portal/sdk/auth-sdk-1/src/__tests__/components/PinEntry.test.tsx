/**
 * PinEntry Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { PinEntry } from '../../components/PinEntry';
import { I18nProvider } from '../../i18n';

// Wrapper component to provide i18n context
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <I18nProvider locale="en">
        {children}
    </I18nProvider>
);

describe('PinEntry Component', () => {
    const mockOnSubmit = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('rendering', () => {
        it('should render 6 input fields by default', () => {
            render(<PinEntry onSubmit={mockOnSubmit} />, { wrapper: TestWrapper });

            const inputs = screen.getAllByRole('textbox');
            expect(inputs).toHaveLength(6);
        });

        it('should render custom number of input fields', () => {
            render(<PinEntry onSubmit={mockOnSubmit} length={4} />, { wrapper: TestWrapper });

            const inputs = screen.getAllByRole('textbox');
            expect(inputs).toHaveLength(4);
        });

        it('should render verify button', () => {
            render(<PinEntry onSubmit={mockOnSubmit} />, { wrapper: TestWrapper });

            expect(screen.getByRole('button', { name: /verify pin/i })).toBeInTheDocument();
        });

        it('should focus first input on mount', () => {
            render(<PinEntry onSubmit={mockOnSubmit} />, { wrapper: TestWrapper });

            const inputs = screen.getAllByRole('textbox');
            expect(inputs[0]).toHaveFocus();
        });
    });

    describe('input behavior', () => {
        it('should only accept numeric input', async () => {
            const user = userEvent.setup();
            render(<PinEntry onSubmit={mockOnSubmit} />, { wrapper: TestWrapper });

            const inputs = screen.getAllByRole('textbox');
            await user.type(inputs[0], 'abc123');

            // Only the numeric characters should be accepted
            expect(inputs[0]).toHaveValue('1');
        });

        it('should auto-advance to next input after typing', async () => {
            const user = userEvent.setup();
            render(<PinEntry onSubmit={mockOnSubmit} />, { wrapper: TestWrapper });

            const inputs = screen.getAllByRole('textbox');
            await user.type(inputs[0], '1');

            expect(inputs[1]).toHaveFocus();
        });

        it('should move to previous input on backspace when empty', async () => {
            const user = userEvent.setup();
            render(<PinEntry onSubmit={mockOnSubmit} />, { wrapper: TestWrapper });

            const inputs = screen.getAllByRole('textbox');

            // Type a digit to move to second input
            await user.type(inputs[0], '1');
            expect(inputs[1]).toHaveFocus();

            // Press backspace on empty second input
            await user.keyboard('{Backspace}');

            expect(inputs[0]).toHaveFocus();
        });

        it('should handle paste of full PIN', async () => {
            render(<PinEntry onSubmit={mockOnSubmit} />, { wrapper: TestWrapper });

            const inputs = screen.getAllByRole('textbox');

            // Create paste event with full PIN
            const pasteEvent = new Event('paste', { bubbles: true });
            Object.defineProperty(pasteEvent, 'clipboardData', {
                value: {
                    getData: () => '123456',
                },
            });

            fireEvent(inputs[0], pasteEvent);

            // All inputs should be filled
            expect(inputs[0]).toHaveValue('1');
            expect(inputs[1]).toHaveValue('2');
            expect(inputs[2]).toHaveValue('3');
            expect(inputs[3]).toHaveValue('4');
            expect(inputs[4]).toHaveValue('5');
            expect(inputs[5]).toHaveValue('6');
        });
    });

    describe('submission', () => {
        it('should auto-submit when all digits are entered', async () => {
            const user = userEvent.setup();
            render(<PinEntry onSubmit={mockOnSubmit} />, { wrapper: TestWrapper });

            const inputs = screen.getAllByRole('textbox');
            await user.type(inputs[0], '123456');

            expect(mockOnSubmit).toHaveBeenCalledWith('123456');
        });

        it('should submit on button click when complete', async () => {
            const user = userEvent.setup();
            render(<PinEntry onSubmit={mockOnSubmit} />, { wrapper: TestWrapper });

            const inputs = screen.getAllByRole('textbox');
            await user.type(inputs[0], '123456');

            vi.clearAllMocks(); // Clear the auto-submit call

            const button = screen.getByRole('button', { name: /verify pin/i });
            await user.click(button);

            expect(mockOnSubmit).toHaveBeenCalledWith('123456');
        });

        it('should not submit when PIN is incomplete', async () => {
            const user = userEvent.setup();
            render(<PinEntry onSubmit={mockOnSubmit} />, { wrapper: TestWrapper });

            const inputs = screen.getAllByRole('textbox');
            await user.type(inputs[0], '123');

            const button = screen.getByRole('button', { name: /verify pin/i });
            await user.click(button);

            // Should not have been called (only auto-submit counts full PIN)
            expect(mockOnSubmit).not.toHaveBeenCalled();
        });

        it('should submit on Enter key when complete', async () => {
            const user = userEvent.setup();
            render(<PinEntry onSubmit={mockOnSubmit} />, { wrapper: TestWrapper });

            const inputs = screen.getAllByRole('textbox');
            await user.type(inputs[0], '123456');

            vi.clearAllMocks();

            await user.keyboard('{Enter}');

            expect(mockOnSubmit).toHaveBeenCalledWith('123456');
        });
    });

    describe('loading state', () => {
        it('should disable inputs when loading', () => {
            render(<PinEntry onSubmit={mockOnSubmit} loading />, { wrapper: TestWrapper });

            const inputs = screen.getAllByRole('textbox');
            inputs.forEach(input => {
                expect(input).toBeDisabled();
            });
        });

        it('should disable button when loading', () => {
            render(<PinEntry onSubmit={mockOnSubmit} loading />, { wrapper: TestWrapper });

            const button = screen.getByRole('button', { name: /verify pin/i });
            expect(button).toBeDisabled();
        });
    });

    describe('accessibility', () => {
        it('should have aria-label on each input', () => {
            render(<PinEntry onSubmit={mockOnSubmit} />, { wrapper: TestWrapper });

            const inputs = screen.getAllByRole('textbox');
            inputs.forEach((input, index) => {
                expect(input).toHaveAttribute('aria-label', `Digit ${index + 1} of 6`);
            });
        });

        it('should have role="group" on input container', () => {
            render(<PinEntry onSubmit={mockOnSubmit} />, { wrapper: TestWrapper });

            expect(screen.getByRole('group', { name: /pin entry/i })).toBeInTheDocument();
        });
    });
});
