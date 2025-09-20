import { useState, useEffect } from 'react';
import { obtenerMovimientos } from '../utils/cajaApi';
import { IFiltrosCaja, TipoMovimiento } from '../types/caja';

interface MetricasDashboard {
  balance: number;
  ingresos: number;
  gastos: number;
  transacciones: number;
}

interface UseDashboardMetricsReturn {
  metricas: MetricasDashboard;
  loading: boolean;
  error: string | null;
  actualizarMetricas: () => Promise<void>;
}

export const useDashboardMetrics = (): UseDashboardMetricsReturn => {
  const [metricas, setMetricas] = useState<MetricasDashboard>({
    balance: 0,
    ingresos: 0,
    gastos: 0,
    transacciones: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calcularFechasPeriodo = () => {
    const ahora = new Date();
    
    // Usar el mes actual dinámicamente
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);
    

    
    return {
      fechaInicio: inicioMes.toISOString().split('T')[0],
      fechaFin: finMes.toISOString().split('T')[0]
    };
  };

  const actualizarMetricas = async () => {
    try {
      setLoading(true);
      setError(null);

      await calcularMetricasManualmente();

    } catch (err) {
      setError('Error al cargar las métricas del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const calcularMetricasManualmente = async () => {
    try {
      const { fechaInicio, fechaFin } = calcularFechasPeriodo();

      // Obtener todos los movimientos del período
      const filtros: IFiltrosCaja = {
        fechaInicio,
        fechaFin,
        limit: 1000 // Obtener muchos registros para cálculo
      };

      const response = await obtenerMovimientos(filtros);
      
      if (response.success && response.data?.movimientos) {
        const movimientos = response.data.movimientos;
        
        const ingresos = movimientos
          .filter(m => m.tipoMovimiento === TipoMovimiento.ENTRADA)
          .reduce((sum, m) => sum + (m.monto || 0), 0);
          
        const gastos = movimientos
          .filter(m => m.tipoMovimiento === TipoMovimiento.SALIDA)
          .reduce((sum, m) => sum + (m.monto || 0), 0);

        const balance = ingresos - gastos;

        setMetricas({
          balance,
          ingresos,
          gastos,
          transacciones: movimientos.length
        });
      }
    } catch (err) {
      // Mantener valores por defecto
    }
  };

  useEffect(() => {
    // Delay de 300ms para evitar peticiones simultáneas
    const timer = setTimeout(() => {
      actualizarMetricas();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return {
    metricas,
    loading,
    error,
    actualizarMetricas
  };
};