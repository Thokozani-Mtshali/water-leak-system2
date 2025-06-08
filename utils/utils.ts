export const getMarkerColor = (severity: string, status: string): string => {
    if (status === 'resolved' || status === 'closed') {
      return '#10B981'; // Green
    }
    switch (severity) {
      case 'critical':
        return '#EF4444'; // Red
      case 'high':
        return '#F59E0B'; // Orange
      case 'medium':
        return '#3B82F6'; // Blue
      case 'low':
        return '#8B5CF6'; // Purple
      default:
        return '#64748B'; // Gray
    }
  };
  