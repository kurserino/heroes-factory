import { useState } from 'react';

export function useHeroListParams() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  function submitSearch(nextSearch: string): void {
    setSearch(nextSearch);
    setPage(1);
  }

  return { page, setPage, search, submitSearch };
}
