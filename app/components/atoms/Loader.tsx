import { Box, CircularProgress, Typography } from "@mui/material";

interface LoaderProps {
  message?: string;
  size?: number;
  fullScreen?: boolean;
}

export default function Loader({ 
  message = "Cargando...", 
  size = 40,
  fullScreen = false 
}: LoaderProps) {
  const content = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        py: fullScreen ? 0 : 8,
        minHeight: fullScreen ? "100vh" : "auto"
      }}
    >
      <CircularProgress size={size} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );

  return content;
}
