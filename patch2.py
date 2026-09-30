import re

with open("src/pages/admin/AdminLeaderProfilePage.jsx", "r") as f:
    code = f.read()

grouping_code = """
  // Group members by family
  const familyGroups = {};
  members.forEach(m => {
    const fid = m.familyId || `single_${m.id}`;
    if (!familyGroups[fid]) familyGroups[fid] = [];
    familyGroups[fid].push(m);
  });

  const families = Object.values(familyGroups).map(group => {
    const head = group.find(m => m.isHead) || group[0];
    return {
      head,
      members: group,
      familyId: head.familyId || `single_${head.id}`,
    };
  });
"""

code = code.replace("  return (\n    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 }", grouping_code + "\n  return (\n    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 }")

with open("src/pages/admin/AdminLeaderProfilePage.jsx", "w") as f:
    f.write(code)
