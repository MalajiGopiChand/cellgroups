import re

with open("src/pages/admin/AdminFamilyProfilePage.jsx", "r") as f:
    code = f.read()

code = code.replace(
    "LocationOn as LocationIcon \n} from '@mui/icons-material';",
    "LocationOn as LocationIcon, DeleteOutline as DeleteIcon \n} from '@mui/icons-material';"
)

with open("src/pages/admin/AdminFamilyProfilePage.jsx", "w") as f:
    f.write(code)
