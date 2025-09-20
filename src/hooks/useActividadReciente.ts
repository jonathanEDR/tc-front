import { useState, useEffect } from 'react';
import { obtenerMovimientos } from '../utils/cajaApi';
import { IMovimientoCaja, IFiltrosCaja, TipoMovimiento } from '../types/caja';

interface ActividadReciente {
  _id: string;
  tipo: 'ingreso' | 'gasto';
  descripcion: string;
  monto: number;
  fechaRelativa: string;
  color: string;
}

interface UseActividadRecienteReturn {
  actividades: ActividadReciente[];
  loading: boolean;
  error: string | null;
  actualizarActividad: () => Promise<void>;
}

export const useActividadReciente = (limite: number = 5): UseActividadRecienteReturn => {
  const [actividades, setActividades] = useState<ActividadReciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calcularTiempoRelativo = (fecha: string): string => {
    const ahora = new Date();
    const fechaMovimiento = new Date(fecha);
    const diferenciaMins = Math.floor((ahora.getTime() - fechaMovimiento.getTime()) / (1000 * 60));

    if (diferenciaMins < 60) {
      return `hace ${diferenciaMins} min${diferenciaMins !== 1 ? 's' : ''}`;
    }

    const diferenciaHoras = Math.floor(diferenciaMins / 60);
    if (diferenciaHoras < 24) {
      return `hace ${diferenciaHoras} hora${diferenciaHoras !== 1 ? 's' : ''}`;
    }

    const diferenciaDias = Math.floor(diferenciaHoras / 24);
    if (diferenciaDias < 7) {
      return `hace ${diferenciaDias} día${diferenciaDias !== 1 ? 's' : ''}`;
    }

    const diferenciaSemanas = Math.floor(diferenciaDias / 7);
    return `hace ${diferenciaSemanas} semana${diferenciaSemanas !== 1 ? 's' : ''}`;
  };

  const formatearMonto = (monto: number, tipo: 'ingreso' | 'gasto'): string => {
    const signo = tipo === 'ingreso' ? '+' : '-';
    return `${signo}S/ ${monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
  };

  const actualizarActividad = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener los movimientos más recientes
      const filtros: IFiltrosCaja = {
        limit: limite * 2, // Obtener más para asegurar diversidad
        page: 1
      };

      const response = await obtenerMovimientos(filtros);
      
      if (response.success && response.data?.movimientos) {
        const movimientosRecientes = response.data.movimientos
          .sort((a, b) => new Date(b.fechaCaja).getTime() - new Date(a.fechaCaja).getTime())
          .slice(0, limite);

        const actividadesProcesadas: ActividadReciente[] = movimientosRecientes.map(movimiento => {
          const esIngreso = movimiento.tipoMovimiento === TipoMovimiento.ENTRADA;
          
          return {
            _id: movimiento._id || '',
            tipo: esIngreso ? 'ingreso' : 'gasto',
            descripcion: movimiento.descripcion,
            monto: movimiento.monto,
            fechaRelativa: calcularTiempoRelativo(movimiento.fechaCaja),
            color: esIngreso ? 'green' : 'red'
          };
        });

        setActividades(actividadesProcesadas);
      } else {
        // Si no hay datos, mostrar actividades placeholder
        setActividades([]);
      }

    } catch (err) {
      console.error('Error cargando actividad reciente:', err);
      setError('Error al cargar la actividad reciente');
      setActividades([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Delay de 200ms para evitar peticiones simultáneas con otros componentes
    const timer = setTimeout(() => {
      actualizarActividad();
    }, 200);

    return () => clearTimeout(timer);
  }, [limite]);

  return {
    actividades,
    loading,
    error,
    actualizarActividad
  };
};