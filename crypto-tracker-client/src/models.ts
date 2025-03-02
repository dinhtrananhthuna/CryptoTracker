// src/models.ts
export interface Coin {
    symbol: string;
    name: string;
    quoteAsset: string;
    totalQuantity: number;
    averageBuyPrice: number;
    currentPrice: number;
    currentValue: number;
    image?: string; // Optional
}
  
export interface Transaction {
    transactionId: number;
    coinId: string;
    transactionType: 'Buy' | 'Sell'; // Sử dụng string literal type
    transactionDate: string; // Có thể dùng Date, nhưng cần xử lý format khi hiển thị
    quantity: number;
    price: number;
    fee?: number; // Optional
    exchange?: string; // Optional
    notes?: string;  //Optional
}