import { expect } from 'chai';
import { calculateDistance } from '../src/pointsOfInterest';

describe('Points of Interest', () => {
  it('should calculate distance correctly', () => {
    const lat1 = 48.86;
    const lon1 = 2.35;
    const lat2 = 48.8759992;
    const lon2 = 2.3481253;
    
    const result = calculateDistance(lat1, lon1, lat2, lon2);
  
    const referenceDistance = 1.7843065307875596; 
  
    expect(result).to.equal(referenceDistance);
  });
});