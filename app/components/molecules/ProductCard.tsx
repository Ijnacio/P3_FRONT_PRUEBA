import { CardMedia, CardContent, CardActions, Typography, Chip, Box } from "@mui/material";
import { useNavigate } from "react-router";
import Card from "../atoms/Card";
import Button from "../atoms/Button";
import type { Producto } from "~/types";

interface ProductCardProps {
  producto: Producto;
  onAddToCart?: (producto: Producto) => void;
  showCategory?: boolean;
}

export default function ProductCard({ 
  producto, 
  onAddToCart,
  showCategory = true 
}: ProductCardProps) {
  const navigate = useNavigate();

  return (
    <Card hoverable sx={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      {producto.stock === 0 && (
        <Box sx={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}>
          <Chip label="Agotado" size="small" color="error" sx={{ fontWeight: "bold" }} />
        </Box>
      )}

      <CardMedia
        component="img"
        height="220"
        image={producto.imagen || producto.fotoUrl ? `http://localhost:3006${producto.imagen || producto.fotoUrl}` : "https://via.placeholder.com/300x220/8B4513/FFFFFF?text=Pasteleria"}
        alt={producto.nombre}
        sx={{ objectFit: "cover", cursor: "pointer" }}
        onClick={() => navigate(`/producto/${producto.id}`)}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ cursor: "pointer" }}
          onClick={() => navigate(`/producto/${producto.id}`)}
        >
          {producto.nombre}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            mb: 2
          }}
        >
          {producto.descripcion || "Producto de nuestra pastelería"}
        </Typography>
        {showCategory && (
          <Chip 
            label={producto.categoria?.nombre || "Sin categoría"} 
            size="small" 
            sx={{ 
              backgroundColor: "#8B4513",
              color: "white",
              fontWeight: "bold"
            }}
          />
        )}
      </CardContent>
      <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
        <Typography variant="h6" color="primary.main" fontWeight="bold">
          ${producto.precio.toLocaleString()}
        </Typography>
        <Button 
          variant="contained" 
          size="small"
          disabled={producto.stock === 0}
          onClick={() => onAddToCart?.(producto)}
        >
          {producto.stock === 0 ? "Agotado" : "Agregar"}
        </Button>
      </CardActions>
    </Card>
  );
}
