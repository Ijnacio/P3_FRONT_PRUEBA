import { Card as MuiCard, CardProps } from "@mui/material";

interface CustomCardProps extends CardProps {
  hoverable?: boolean;
}

export default function Card({ 
  children, 
  hoverable = false,
  sx,
  ...props 
}: CustomCardProps) {
  return (
    <MuiCard
      {...props}
      sx={{
        transition: "all 0.3s ease",
        ...(hoverable && {
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: 4,
          }
        }),
        ...sx
      }}
    >
      {children}
    </MuiCard>
  );
}
