// Common Trash Bin Engine for UAE Tuition & Daycare ERP

export const getTrashBinItems = () => {
  try {
    const raw = localStorage.getItem('common_trash_items');
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
};

export const addToTrashBin = (item, category, title) => {
  try {
    const current = getTrashBinItems();
    const trashEntry = {
      trashId: `trash-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      category: category, // 'Students' | 'Staff' | 'Classes' | 'POS Items' | 'Capital Assets'
      title: title || item.name || item.item_name || item.subject || 'Deleted Item',
      deletedAt: new Date().toISOString(),
      originalData: item
    };
    const updated = [trashEntry, ...current];
    localStorage.setItem('common_trash_items', JSON.stringify(updated));
    window.dispatchEvent(new Event('common_trash_updated'));
  } catch (err) {
    console.error('Error adding to common trash:', err);
  }
};

export const restoreTrashItem = (trashId) => {
  try {
    const current = getTrashBinItems();
    const target = current.find(t => t.trashId === trashId);
    if (!target) return;

    const remaining = current.filter(t => t.trashId !== trashId);
    localStorage.setItem('common_trash_items', JSON.stringify(remaining));

    const item = target.originalData;
    const category = target.category;

    // Restore to appropriate storage key
    if (category === 'Students') {
      const existing = JSON.parse(localStorage.getItem('registered_students') || '[]');
      localStorage.setItem('registered_students', JSON.stringify([item, ...existing.filter(s => s.id !== item.id)]));
    } else if (category === 'Staff') {
      const existing = JSON.parse(localStorage.getItem('registered_staff') || '[]');
      localStorage.setItem('registered_staff', JSON.stringify([item, ...existing.filter(s => s.id !== item.id)]));
    } else if (category === 'Classes') {
      const existing = JSON.parse(localStorage.getItem('registered_class_schedules') || '[]');
      localStorage.setItem('registered_class_schedules', JSON.stringify([item, ...existing.filter(s => s.id !== item.id)]));
    } else if (category === 'POS Items') {
      const existing = JSON.parse(localStorage.getItem('registered_inventory') || '[]');
      localStorage.setItem('registered_inventory', JSON.stringify([item, ...existing.filter(s => s.id !== item.id)]));
    } else if (category === 'Capital Assets') {
      const existing = JSON.parse(localStorage.getItem('registered_assets') || '[]');
      localStorage.setItem('registered_assets', JSON.stringify([item, ...existing.filter(s => s.id !== item.id)]));
    }

    window.dispatchEvent(new Event('common_trash_updated'));
    window.dispatchEvent(new Event('registered_data_updated'));
  } catch (err) {
    console.error('Error restoring item from trash:', err);
  }
};

export const deleteTrashItemPermanently = (trashId) => {
  try {
    const current = getTrashBinItems();
    const updated = current.filter(t => t.trashId !== trashId);
    localStorage.setItem('common_trash_items', JSON.stringify(updated));
    window.dispatchEvent(new Event('common_trash_updated'));
  } catch (err) {
    console.error('Error deleting item from trash:', err);
  }
};

export const emptyAllTrash = () => {
  try {
    localStorage.setItem('common_trash_items', JSON.stringify([]));
    window.dispatchEvent(new Event('common_trash_updated'));
  } catch (err) {
    console.error('Error emptying common trash:', err);
  }
};
