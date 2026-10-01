import re

with open("src/pages/admin/AdminLeaderProfilePage.jsx", "r") as f:
    code = f.read()

# 1. Imports
if "import * as XLSX" not in code:
    code = code.replace(
        "import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';",
        "import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';\nimport * as XLSX from 'xlsx';\nimport { Download as DownloadIcon } from '@mui/icons-material';"
    )
    if "Button" not in code.split("from '@mui/material'")[0]:
        code = code.replace("import { Box, Typography, Paper, Grid, Chip, Avatar, CircularProgress, Divider } from '@mui/material';", "import { Box, Typography, Paper, Grid, Chip, Avatar, CircularProgress, Divider, Button } from '@mui/material';")

with open("src/pages/admin/AdminLeaderProfilePage.jsx", "w") as f:
    f.write(code)
