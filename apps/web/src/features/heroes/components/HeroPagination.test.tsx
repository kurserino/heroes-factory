import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { HeroPagination } from './HeroPagination';

describe('HeroPagination', () => {
  it('renders nothing when there is only one page', () => {
    const { container } = render(
      <HeroPagination
        pagination={{ page: 1, limit: 10, total: 3, totalPages: 1 }}
        onPageChange={vi.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('requests the correct page when a different page is clicked', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <HeroPagination
        pagination={{ page: 1, limit: 10, total: 25, totalPages: 3 }}
        onPageChange={onPageChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Go to page 2' }));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
