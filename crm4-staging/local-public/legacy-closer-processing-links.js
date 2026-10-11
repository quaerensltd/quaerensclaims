// Badge-only transport. No raw processingFiles documents enter the browser.
export async function loadProcessingLinkIds(call, assignmentIds) {
  const ids = [...new Set(assignmentIds)];
  if (ids.some(id => typeof id !== "string" || !/^[A-Za-z0-9_-]{1,180}$/.test(id))) throw new Error("Invalid assignment identifier.");
  const linked = new Set();
  for (let offset = 0; offset < ids.length; offset += 50) {
    const batch = ids.slice(offset, offset + 50);
    const { data } = await call({ assignmentIds: batch });
    if (!data || Object.keys(data).length !== 1 || !Array.isArray(data.linkedAssignmentIds)
      || data.linkedAssignmentIds.length > batch.length || data.linkedAssignmentIds.some(id => !batch.includes(id))) throw new Error("Invalid Processing linkage response.");
    data.linkedAssignmentIds.forEach(id => linked.add(id));
  }
  return linked;
}
