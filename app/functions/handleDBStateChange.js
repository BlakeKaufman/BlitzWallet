export default function handleDBStateChange(
  newData,
  setMasterInfoObject,
  toggleMasterInfoObject,
  saveTimeoutRef,
) {
  setMasterInfoObject(prev => ({
    ...prev,
    ...newData,
  }));

  if (saveTimeoutRef.current) {
    clearTimeout(saveTimeoutRef.current);
  }

  saveTimeoutRef.current = setTimeout(() => {
    toggleMasterInfoObject(newData);
  }, 800);
}
