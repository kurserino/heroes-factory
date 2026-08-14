import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { HeroSearch } from './HeroSearch';

describe('HeroSearch', () => {
  it('calls onSubmit with the trimmed search value when submitted', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<HeroSearch initialValue="" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Search heroes'), '  spider  ');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(onSubmit).toHaveBeenCalledWith('spider');
  });

  it('does not call onSubmit while the user is still typing', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<HeroSearch initialValue="" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Search heroes'), 'spider');

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
