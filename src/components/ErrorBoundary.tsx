import { Component, type ReactNode } from 'react';

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <main className="error-screen">
          <img src="/assets/mark.svg" alt="" width="48" />
          <h1>Esta partida se ha interrumpido.</h1>
          <p>Recarga la aplicación para volver a tu punto de guardado.</p>
          <button className="button primary" onClick={() => window.location.reload()}>
            Volver a cargar
          </button>
        </main>
      );
    return this.props.children;
  }
}
