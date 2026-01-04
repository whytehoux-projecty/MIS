/**
 * PinEntry - Component for entering a PIN code
 */

import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '../i18n';
import { Button } from './ui/Button';

export interface PinEntryProps {
    /** Called when PIN is submitted */
    onSubmit: (pin: string) => void;
    /** Number of digits in PIN */
    length?: number;
    /** Loading state */
    loading?: boolean;
    /** Custom class name */
    className?: string;
}

export const PinEntry: React.FC<PinEntryProps> = ({
    onSubmit,
    length = 6,
    loading = false,
    className = '',
}) => {
    const { t, interpolate } = useI18n();
    const [pin, setPin] = useState<string[]>(Array(length).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Focus first input on mount
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    // Handle input change
    const handleChange = (index: number, value: string) => {
        // Only allow digits
        if (!/^\d*$/.test(value)) return;

        const newPin = [...pin];
        newPin[index] = value.slice(-1); // Take only the last character if multiple
        setPin(newPin);

        // Auto-focus next input
        if (value && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when complete
        if (value && index === length - 1 && newPin.every(d => d !== '')) {
            onSubmit(newPin.join(''));
        }
    };

    // Handle backspace
    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }

        if (e.key === 'Enter') {
            const fullPin = pin.join('');
            if (fullPin.length === length) {
                onSubmit(fullPin);
            }
        }
    };

    // Handle paste
    const handlePaste = (e: React.ClipboardEvent, startIndex: number) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');

        if (pastedData) {
            const newPin = [...pin];
            const digits = pastedData.split('').slice(0, length - startIndex);

            digits.forEach((digit, i) => {
                const targetIndex = startIndex + i;
                if (targetIndex < length) {
                    newPin[targetIndex] = digit;
                }
            });

            setPin(newPin);

            // Focus the input after the pasted segment
            const nextIndex = Math.min(startIndex + digits.length, length - 1);
            inputRefs.current[nextIndex]?.focus();

            // Check if complete after paste
            if (newPin.every(d => d !== '') && newPin.join('').length === length) {
                onSubmit(newPin.join(''));
            }
        }
    };

    // Manual submit
    const handleSubmit = () => {
        const fullPin = pin.join('');
        if (fullPin.length === length) {
            onSubmit(fullPin);
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* PIN Inputs */}
            <div className="flex justify-center gap-2" role="group" aria-label="PIN Entry">
                {pin.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={(e) => handlePaste(e, index)}
                        disabled={loading}
                        aria-label={interpolate(t.pinEntry.digitLabel, { current: index + 1, total: length })}
                        autoComplete="one-time-code"
                        className={`
              w-12 h-14 text-center text-2xl font-mono font-bold
              border-2 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
              disabled:bg-gray-100 disabled:cursor-not-allowed
              dark:bg-gray-800 dark:border-gray-600 dark:text-white
              ${digit ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-300'}
            `}
                    />
                ))}
            </div>

            {/* Submit Button */}
            <Button
                onClick={handleSubmit}
                fullWidth
                loading={loading}
                disabled={pin.some(d => d === '')}
            >
                {t.pinEntry.verifyButton}
            </Button>
        </div>
    );
};
