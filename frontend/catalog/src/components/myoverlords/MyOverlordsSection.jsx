import React, { useEffect, useState } from "react";
import { Box } from "@mui/joy";
import { useOverlordStore } from "../../store/useOverlordsStore";
import OverlordsSkeleton from "./OverlordsSkeleton";
import MyOverlordsCarousel from "./MyOverlordsCarousel"; // Ez marad a carousel neve
import CreateOverlordModal from "./CreateOverlordModal";
import EditOverlordModal from "./EditOverlordModal";

const MyOverlordsSection = () => {
  const fetchOverlords = useOverlordStore((state) => state.fetchOverlords);
  const overlords = useOverlordStore((state) => state.overlords);
  const isLoading = useOverlordStore((state) => state.isLoading);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingOverlord, setEditingOverlord] = useState(null);

  useEffect(() => {
    fetchOverlords();
  }, [fetchOverlords]);

  const handleCreateOpen = () => {
    setCreateModalOpen(true);
  };

  const handleCreateSave = async () => {
    await fetchOverlords();
    setCreateModalOpen(false);
  };

  const handleEditOpen = (overlord) => {
    setEditingOverlord(overlord);
    setEditModalOpen(true);
  };

  const handleEditSave = async () => {
    await fetchOverlords();
    setEditModalOpen(false);
    setEditingOverlord(null);
  };

  const handleEditClose = () => {
    setEditModalOpen(false);
    setEditingOverlord(null);
  };

  if (isLoading) return <OverlordsSkeleton />;

  return (
    <Box sx={{ mt: 4 }}>
      <MyOverlordsCarousel
        overlords={overlords}
        onEdit={handleEditOpen}
        onCreate={handleCreateOpen}
      />

      <CreateOverlordModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleCreateSave}
      />

      {editingOverlord && (
        <EditOverlordModal
          open={editModalOpen}
          onClose={handleEditClose}
          overlord={editingOverlord}
          onSave={handleEditSave}
        />
      )}
    </Box>
  );
};

export default MyOverlordsSection;
