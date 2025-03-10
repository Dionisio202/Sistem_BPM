export interface CardData {
    id: number;
    title: string;
    value: number;
    icon: string;
  }
  
  export interface DashboardData {
    cards: CardData[];
  }