import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Box, IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import { MouseEvent, useState } from "react";
import { useDeleteHeroMutation } from "../api/heroesQueries";
import { ApiError } from "../../../lib/apiClient";
import { Hero } from "../types/hero";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { HeroStatusToggle } from "./HeroStatusToggle";

interface HeroActionsProps {
  hero: Hero;
  onEdit: (hero: Hero) => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

// All per-hero actions are grouped behind a three-dot "More actions"
// overflow menu (FR-014/FR-014a). Active heroes see Edit, Delete, and the
// deactivation toggle; inactive heroes see only the reactivation toggle —
// Edit/Delete are never rendered for an inactive hero. Edit/Delete are
// icon-only (FR-014b), with a Tooltip + aria-label supplying the accessible
// name that the missing visible text would otherwise provide.
export function HeroActions({
  hero,
  onEdit,
  onSuccess,
  onError,
}: HeroActionsProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const deleteMutation = useDeleteHeroMutation();
  const menuOpen = anchorEl !== null;

  function openMenu(event: MouseEvent<HTMLElement>): void {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  }

  function closeMenu(): void {
    setAnchorEl(null);
  }

  function selectEdit(): void {
    closeMenu();
    onEdit(hero);
  }

  function selectDelete(): void {
    closeMenu();
    setConfirmingDelete(true);
  }

  function confirmDelete(): void {
    deleteMutation.mutate(hero.id, {
      onSuccess: () => {
        onSuccess("Hero deleted.");
        setConfirmingDelete(false);
      },
      onError: (error: unknown) => {
        const message =
          error instanceof ApiError ? error.message : "Something went wrong.";
        onError(message);
        setConfirmingDelete(false);
      },
    });
  }

  return (
    <Box
      sx={{ position: "absolute", top: 4, right: 4 }}
      onClick={(event) => event.stopPropagation()}
    >
      <IconButton
        aria-label={`More actions for ${hero.name}`}
        onClick={openMenu}
        size="small"
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
      {/* keepMounted: closing the menu must not unmount HeroStatusToggle,
          which owns its own StatusConfirmDialog + pending-mutation state
          that needs to survive after the menu itself closes on selection. */}
      <Menu anchorEl={anchorEl} open={menuOpen} onClose={closeMenu} keepMounted>
        {hero.is_active && (
          <Tooltip title="Edit">
            <MenuItem onClick={selectEdit} aria-label={`Edit ${hero.name}`}>
              <EditIcon />
            </MenuItem>
          </Tooltip>
        )}
        {hero.is_active && (
          <Tooltip title="Delete">
            <MenuItem onClick={selectDelete} aria-label={`Delete ${hero.name}`}>
              <DeleteIcon />
            </MenuItem>
          </Tooltip>
        )}
        <HeroStatusToggle
          hero={hero}
          onSuccess={onSuccess}
          onError={onError}
          onSelect={closeMenu}
        />
      </Menu>

      <DeleteConfirmDialog
        hero={confirmingDelete ? hero : null}
        isPending={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </Box>
  );
}
