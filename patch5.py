import re

with open("src/pages/admin/AdminFamilyProfilePage.jsx", "r") as f:
    code = f.read()

if "DeleteOutline as DeleteIcon" not in code:
    code = code.replace(
        "import { Box, Typography, Paper, IconButton, Grid, Avatar, Divider, CircularProgress, Chip } from '@mui/material';",
        "import { Box, Typography, Paper, IconButton, Grid, Avatar, Divider, CircularProgress, Chip } from '@mui/material';\nimport { DeleteOutline as DeleteIcon } from '@mui/icons-material';"
    )

with open("src/pages/admin/AdminFamilyProfilePage.jsx", "w") as f:
    f.write(code)
