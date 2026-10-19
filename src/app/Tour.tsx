import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '../components/Button';

const steps = [
  {
    path: '/',
    title: 'Todo empieza en un mismo punto.',
    text: 'Presenta el problema: tus juegos, amigos y ofertas están repartidos entre plataformas. SavePoint reúne los tres.',
  },
  {
    path: '/library',
    title: 'Tu colección, sin fronteras.',
    text: 'Busca Hades: una sola entrada con Steam y Epic Games. Prueba los filtros y cambia el estado de un juego.',
  },
  {
    path: '/friends',
    title: 'Una buena partida empieza con tu gente.',
    text: 'Abre «¿A qué jugamos?» y selecciona a Jaime. El comparador busca juegos compartidos y plataformas compatibles.',
  },
  {
    path: '/',
    title: 'La interfaz sigue tu contexto.',
    text: 'Cambia «Explorando» a «En partida». Tu escuadrón y las herramientas de sesión pasan al primer plano.',
  },
  {
    path: '/marketplace?tab=agents',
    title: 'Tu agente espera el momento.',
    text: 'Pulsa «Simular mercado». El agente de Portal 2 comprueba tus condiciones, crea un pedido ficticio y añade el juego a la biblioteca. Restablece la demo si ya ejecutaste esta compra.',
  },
];
export function Tour({ onClose }: { onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();
  const step = steps[index] ?? steps[0]!;
  useEffect(() => {
    void navigate(step.path);
  }, [step.path, navigate]);
  return (
    <aside className="tour" aria-label="Recorrido de demostración">
      <div className="tour-label">
        RECORRIDO PARA PRESENTAR · {index + 1}/5
        <button className="icon-button" onClick={onClose} aria-label="Cerrar recorrido">
          <X size={16} />
        </button>
      </div>
      <h3>{step.title}</h3>
      <p>{step.text}</p>
      <progress value={index + 1} max={steps.length} aria-label="Progreso del recorrido" />
      <div className="button-row">
        <Button
          size="small"
          variant="ghost"
          disabled={index === 0}
          onClick={() => setIndex(index - 1)}
        >
          Anterior
        </Button>
        <Button
          size="small"
          variant="primary"
          onClick={() => (index === steps.length - 1 ? onClose() : setIndex(index + 1))}
        >
          {index === steps.length - 1 ? 'Terminar' : 'Siguiente paso'}
        </Button>
      </div>
    </aside>
  );
}
