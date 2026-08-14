import { Pagination } from '@mui/material';
import { PaginationMeta } from '../types/hero';

interface HeroPaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function HeroPagination({ pagination, onPageChange }: HeroPaginationProps) {
  if (pagination.totalPages <= 1) {
    return null;
  }

  return (
    <Pagination
      count={pagination.totalPages}
      page={pagination.page}
      onChange={(_event, page) => onPageChange(page)}
      color="primary"
    />
  );
}
