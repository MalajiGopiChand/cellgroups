import re

with open("src/pages/admin/AdminMembersPage.jsx", "r") as f:
    code = f.read()

code = code.replace(
    "<AdminFamilyProfilePage family={selectedFamily} onBack={() => setSelectedFamily(null)} />",
    "<AdminFamilyProfilePage family={selectedFamily} onBack={() => setSelectedFamily(null)} onDeleteMember={handleDelete} />"
)

with open("src/pages/admin/AdminMembersPage.jsx", "w") as f:
    f.write(code)
