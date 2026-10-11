/**
 * Room Allocator Component Helper
 */
const RoomModule = {
  async filterByBlock(block) {
    const res = await window.API.get(`/api/rooms/all`);
    if (!res.success) return [];
    if (!block) return res.data;
    return res.data.filter(r => r.block === block);
  }
};

window.RoomModule = RoomModule;
