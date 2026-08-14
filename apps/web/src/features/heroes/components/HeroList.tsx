import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { FeedbackMessage, FeedbackSnackbar } from '../../../components/ui/FeedbackSnackbar';
import { useHeroListQuery } from '../api/heroesQueries';
import { useHeroListParams } from '../hooks/useHeroListParams';
import { Hero } from '../types/hero';
import { HeroCard } from './HeroCard';
import { HeroDetailsDialog } from './HeroDetailsDialog';
import { HeroFormDialog, HeroFormMode } from './HeroFormDialog';
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
  const [formState, setFormState] = useState<HeroFormMode | null>(null);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

  // If a create/edit/status/delete operation leaves the current page beyond
  // what now exists (e.g. deleting the last hero on the last page), fall
  // back to the last valid page (FR-016 / the pagination clarification).
  useEffect(() => {
    if (data && data.pagination.totalPages > 0 && page > data.pagination.totalPages) {
      setPage(data.pagination.totalPages);
    }
  }, [data, page, setPage]);

  function handleSuccess(message: string): void {
    setFeedback({ severity: 'success', text: message });
  }

  function handleError(message: string): void {
    setFeedback({ severity: 'error', text: message });
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Box flexGrow={1}>
          <HeroSearch initialValue={search} onSubmit={submitSearch} />
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setFormState({ type: 'create' })}
        >
          Create Hero
        </Button>
      </Stack>

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
              <HeroCard
                key={hero.id}
                hero={hero}
                onSelect={setSelectedHero}
                onEdit={(h) => setFormState({ type: 'edit', hero: h })}
                onActionSuccess={handleSuccess}
                onActionError={handleError}
              />
            ))}
          </Box>
          <Box display="flex" justifyContent="center">
            <HeroPagination pagination={data.pagination} onPageChange={setPage} />
          </Box>
        </>
      )}

      <HeroDetailsDialog hero={selectedHero} onClose={() => setSelectedHero(null)} />
      <HeroFormDialog
        state={formState}
        onClose={() => setFormState(null)}
        onSuccess={handleSuccess}
        onError={handleError}
      />
      <FeedbackSnackbar message={feedback} onClose={() => setFeedback(null)} />
    </Stack>
  );
}
