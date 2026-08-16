import { useEffect } from 'react';
import { useApp } from '../context/AppContext'

export default function useCurrentUser() {
  const { actions } = useApp();
  useEffect(() => { actions.loadMe(); }, []);
}
