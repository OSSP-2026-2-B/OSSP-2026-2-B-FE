import { useEffect, useState } from 'react';
import { getObservations } from '../../shared/api/observations';

const REFRESH_INTERVAL = 10 * 60 * 1000;

export default function useObservations() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let timer;

    async function refresh() {
      try {
        const observation = await getObservations(controller.signal);
        if (!controller.signal.aborted) {
          setData(observation);
          setError('');
        }
      } catch (cause) {
        if (!controller.signal.aborted) {
          setData(null);
          setError(cause.response?.data?.error?.message || '강우 정보를 불러오지 못했어요.');
        }
      } finally {
        if (!controller.signal.aborted) timer = setTimeout(refresh, REFRESH_INTERVAL);
      }
    }

    refresh();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [attempt]);

  function retry() {
    setError('');
    setAttempt(previous => previous + 1);
  }

  return { data, error, retry };
}
