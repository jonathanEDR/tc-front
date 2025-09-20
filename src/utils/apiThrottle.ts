// Utilidad para controlar rate limiting de peticiones API
class APIThrottle {
  private requestTimes: Map<string, number[]> = new Map();
  private readonly maxRequestsPerSecond = 3; // Máximo 3 peticiones por segundo
  private readonly timeWindow = 1000; // 1 segundo

  canMakeRequest(endpoint: string): boolean {
    const now = Date.now();
    const endpointTimes = this.requestTimes.get(endpoint) || [];
    
    // Filtrar solo las peticiones del último segundo
    const recentTimes = endpointTimes.filter(time => now - time < this.timeWindow);
    
    // Actualizar el registro para este endpoint
    this.requestTimes.set(endpoint, recentTimes);
    
    return recentTimes.length < this.maxRequestsPerSecond;
  }

  recordRequest(endpoint: string): void {
    const now = Date.now();
    const endpointTimes = this.requestTimes.get(endpoint) || [];
    endpointTimes.push(now);
    this.requestTimes.set(endpoint, endpointTimes);
  }

  async waitForSlot(endpoint: string): Promise<void> {
    while (!this.canMakeRequest(endpoint)) {
      await new Promise(resolve => setTimeout(resolve, 100)); // Esperar 100ms
    }
    this.recordRequest(endpoint);
  }

  getDelay(endpoint: string): number {
    const endpointTimes = this.requestTimes.get(endpoint) || [];
    return endpointTimes.length * 200; // 200ms por cada petición previa
  }
}

export const apiThrottle = new APIThrottle();