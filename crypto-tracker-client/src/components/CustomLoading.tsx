// components/CustomLoading.tsx
import React from 'react';
import { Skeleton, Box, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material';

interface CustomLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  variant?: 'table' | 'circular' | 'text' | 'rectangular'; // Thêm variant
  rows?: number; // Số hàng cho skeleton table
  columns?: number; // Số cột cho skeleton table
  width?: string | number; // Chiều rộng cho skeleton khác
  height?: string | number;// Chiều cao cho skeleton khác
}

const CustomLoading: React.FC<CustomLoadingProps> = ({
  isLoading,
  children,
  variant = 'table', // Mặc định là table
  rows = 5, // Mặc định 5 hàng
  columns = 7, //Mặc định 7 cột.
  width,
  height
}) => {
  if (!isLoading) {
    return <>{children}</>;
  }

  if (variant === 'table') {
    return (
      <TableContainer component={Paper}>
        <Table aria-label="loading table">
          <TableHead>
            <TableRow>
              {Array.from({ length: columns }).map((_, index) => (
                <TableCell key={index}>
                  <Skeleton />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  // Các variant khác
  if(variant === 'circular'){
    return <Skeleton variant="circular" width={width} height={height} />;
  }

  if (variant === 'text') {
        return (
            <Box width={width}>
              <Skeleton />
              <Skeleton animation="wave" />
              <Skeleton animation={false} />
            </Box>
        );
    }
  return <Skeleton variant={variant} width={width} height={height} />; //rectangular, ...
};

export default CustomLoading;