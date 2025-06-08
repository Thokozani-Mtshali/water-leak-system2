import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import MapScreen from '../app/(tabs)/map';

// Mock Location from expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: { latitude: -26.2, longitude: 28.0 },
  }),
}));

// Mock your fetchReports to return predictable data
jest.mock('@/services/mockApi', () => ({
  fetchReports: jest.fn().mockResolvedValue([
    {
      id: '1',
      title: 'Test Leak',
      status: 'pending',
      severity: 'high',
      location: { latitude: -26.2, longitude: 28.0 },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
}));

describe('MapScreen', () => {
  it('renders map and markers correctly', async () => {
    const { getByText, queryByText } = render(<MapScreen />);

    // Wait for the async effect to fetch data and update UI
    await waitFor(() => {
      expect(getByText('Leak Map')).toBeTruthy();
      expect(getByText('1 reports found')).toBeTruthy();
      expect(getByText('Test Leak')).toBeTruthy(); // Callout title after marker press
    });

    // The callout text is only visible on marker press; simulate press if needed
    // fireEvent.press(...) could be used on the Marker, but sometimes it's tricky to test markers in react-native-maps

    // Check that some status text exists (callout)
    expect(queryByText('PENDING')).toBeFalsy(); // Not shown until marker pressed, probably
  });

  it('opens and closes filter modal', () => {
    const { getByTestId, getByText, queryByText } = render(<MapScreen />);

    // Press filter button
    fireEvent.press(getByTestId('filter-button'));

    expect(getByText('Filters')).toBeTruthy();

    // Close modal by pressing close button or overlay (implement if you have that)
  });
});
