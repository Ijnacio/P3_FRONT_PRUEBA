import { TextField, TextFieldProps } from "@mui/material";

interface InputProps extends Omit<TextFieldProps, "variant"> {
  variant?: "outlined" | "filled" | "standard";
}

export default function Input({ variant = "outlined", ...props }: InputProps) {
  return (
    <TextField
      variant={variant}
      fullWidth
      {...props}
    />
  );
}
