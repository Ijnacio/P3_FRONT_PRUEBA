import { Button as MuiButton, ButtonProps, CircularProgress } from "@mui/material";

interface CustomButtonProps extends ButtonProps {
  loading?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  children, 
  loading, 
  disabled, 
  fullWidth,
  ...props 
}: CustomButtonProps) {
  return (
    <MuiButton
      {...props}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      sx={{
        position: "relative",
        ...props.sx
      }}
    >
      {loading && (
        <CircularProgress
          size={20}
          sx={{
            position: "absolute",
            color: "inherit",
          }}
        />
      )}
      <span style={{ visibility: loading ? "hidden" : "visible" }}>
        {children}
      </span>
    </MuiButton>
  );
}
