import { Box, Stack } from '@mui/material';
import { useState } from 'react';
import { useHeroListQuery } from '../api/heroesQueries';
import { useHeroListParams } from '../hooks/useHeroListParams';
import { Hero } from '../types/hero';
import { HeroCard } from './HeroCard';
import { HeroDetailsDialog } from './HeroDetailsDialog';
import {
  HeroListEmpty,
  HeroListError,
  HeroListLoading,
  HeroListNoResults,
} from './HeroListStates';
import { HeroPagination } from './HeroPagination';
import { HeroSearch } from './HeroSearch';

export function HeroList() {
  const { page, setPage, search, submitSearch } = useHeroListParams();
  const { data, isPending, isError } = useHeroListQuery(page, search || undefined);
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);

  return (
    <Stack spacing={3}>
      <HeroSearch initialValue={search} onSubmit={submitSearch} />

      {isPending && <HeroListLoading />}
      {!isPending && isError && <HeroListError />}

      {!isPending && !isError && data && data.data.length === 0 && (
        search ? <HeroListNoResults search={search} /> : <HeroListEmpty />
      )}

      {!isPending && !isError && data && data.data.length > 0 && (
        <>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: {
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(5, 1fr)',
              },
            }}
          >
            {data.data.map((hero) => (
              <HeroCard key={hero.id} hero={hero} onSelect={setSelectedHero} />
            ))}
          </Box>
          <Box display="flex" justifyContent="center">
            <HeroPagination pagination={data.pagination} onPageChange={setPage} />
          </Box>
        </>
      )}

      <HeroDetailsDialog hero={selectedHero} onClose={() => setSelectedHero(null)} />
    </Stack>
  );
}
