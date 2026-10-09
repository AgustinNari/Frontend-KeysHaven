import { localizeErrorMessage } from '../../utils/displayText';
import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card bg-danger text-white p-3">
          <h5>Ocurrió un error en este componente</h5>
          <pre style={{whiteSpace:'pre-wrap', color:'#fff'}}>{localizeErrorMessage(String(this.state.error))}</pre>
          <button className="btn btn-light btn-sm mt-2" onClick={() => this.setState({ hasError: false, error: null })}>Intentar de nuevo</button>
        </div>
      );
    }
    return this.props.children;
  }
}
