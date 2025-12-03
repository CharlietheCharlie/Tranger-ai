import React from 'react';
import { render, act } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import { describe, it, expect, vi } from 'vitest';
import { TripGeneratorModal } from '../../components/TripGeneratorModal';
import { ActivityCard } from '../../components/ActivityCard';
import { EditItineraryModal } from '../../components/EditItineraryModal';
import { LanguageProvider, useLanguage } from '../../contexts/LanguageContext';
import { useStore } from '../../services/store';

// Helper component to test Context
const LanguageTester = () => {
    const { t, setLocale } = useLanguage();
    return (
        <div>
            <span data-testid="title">{t('appTitle')}</span>
            <button onClick={() => setLocale('zh-TW')}>Switch TW</button>
        </div>
    );
};

// Mock dependencies
vi.mock('@dnd-kit/sortable', () => ({
    useSortable: () => ({
        attributes: {},
        listeners: {},
        setNodeRef: vi.fn(),
        transform: null,
        transition: null,
        isDragging: false,
    }),
}));

describe('UI Integration', () => {

    describe('LanguageContext', () => {
        it('switches language correctly', () => {
            render(
                <LanguageProvider>
                    <LanguageTester />
                </LanguageProvider>
            );

            expect(screen.getByTestId('title')).toHaveTextContent('Tranger');
            
            fireEvent.click(screen.getByText('Switch TW'));
            
            expect(screen.getByTestId('title')).toHaveTextContent('Tranger 旅程');
        });
    });

    describe('ActivityCard', () => {
        const mockActivity = {
            id: 'a1',
            title: 'Test Activity',
            startTime: '10:00',
            duration: 60,
            tags: ['Fun'],
            location: 'Test Location',
            cost: 100
        };

        it('renders activity details correctly', () => {
            render(<ActivityCard activity={mockActivity} dayId="d1" />);
            
            expect(screen.getByText('Test Activity')).toBeInTheDocument();
            expect(screen.getByText('10:00')).toBeInTheDocument();
            expect(screen.getByText('$100')).toBeInTheDocument();
            expect(screen.getByText('Fun')).toBeInTheDocument();
        });

        it('calls onClick when clicked', () => {
            const handleClick = vi.fn();
            render(<ActivityCard activity={mockActivity} dayId="d1" onClick={handleClick} />);
            
            fireEvent.click(screen.getByText('Test Activity'));
            expect(handleClick).toHaveBeenCalled();
        });

        it('opens google maps when location is clicked', () => {
            render(<ActivityCard activity={mockActivity} dayId="d1" />);
            
            fireEvent.click(screen.getByText('Test Location'));
            expect(window.open).toHaveBeenCalledWith(
                expect.stringContaining('https://www.google.com/maps/search'), 
                '_blank'
            );
        });
    });

    describe('TripGeneratorModal', () => {
        it('renders and validates input', () => {
            const handleClose = vi.fn();
            render(
                <LanguageProvider>
                    <TripGeneratorModal isOpen={true} onClose={handleClose} />
                </LanguageProvider>
            );

            // Check elements
            expect(screen.getByText('Use AI Assistant')).toBeInTheDocument();
            
            // Try to generate without destination
            const generateBtn = screen.getByRole('button', { name: /Generate Itinerary/i });
            expect(generateBtn).toBeDisabled();
        });

        it('adds destination tags', async () => {
            const handleClose = vi.fn();
            render(
                <LanguageProvider>
                    <TripGeneratorModal isOpen={true} onClose={handleClose} />
                </LanguageProvider>
            );

            const input = screen.getByPlaceholderText('Add a city...');
            fireEvent.change(input, { target: { value: 'Kyoto' } });
            fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

            expect(screen.getByText('Kyoto')).toBeInTheDocument();
            
            const generateBtn = screen.getByRole('button', { name: /Generate Itinerary/i });
            expect(generateBtn).not.toBeDisabled();
        });
    });

    describe('EditItineraryModal', () => {
        const mockItinerary = {
            id: 't1',
            name: 'Test Trip',
            destination: 'Paris',
            startDate: '2024-01-01',
            endDate: '2024-01-05',
            days: [],
            collaborators: [],
            comments: []
        };

        it('handles image upload correctly', async () => {
            const handleClose = vi.fn();
            const handleDelete = vi.fn();

            render(
                <LanguageProvider>
                    <EditItineraryModal 
                        isOpen={true} 
                        onClose={handleClose} 
                        itinerary={mockItinerary} 
                        onDelete={handleDelete} 
                    />
                </LanguageProvider>
            );

            // 1. Check initial state (Upload placeholder should be present)
            expect(screen.getByText('Click to upload image')).toBeInTheDocument();

            // 2. Mock FileReader
            const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
            
            const readAsDataURL = vi.fn();
            const dummyFileReader = {
                readAsDataURL,
                result: 'data:image/png;base64,fakeimagestring',
                onloadend: null as any,
            };

            // @ts-ignore
            window.FileReader = vi.fn(() => dummyFileReader);

            // 3. Simulate file selection
            const input = document.querySelector('input[type="file"]') as HTMLInputElement;
            fireEvent.change(input, { target: { files: [file] } });

            expect(readAsDataURL).toHaveBeenCalledWith(file);

            // 4. Trigger the onloadend manually to update state
            act(() => {
                if (dummyFileReader.onloadend) {
                    // @ts-ignore
                    dummyFileReader.onloadend();
                }
            });

            // 5. Verify the UI updated (Remove button should appear)
            await waitFor(() => {
                expect(screen.getByText('Remove')).toBeInTheDocument();
                expect(screen.getByAltText('Preview')).toBeInTheDocument();
            });
        });
    });
});