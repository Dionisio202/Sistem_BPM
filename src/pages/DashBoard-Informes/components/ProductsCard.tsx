import React from 'react';
import Card from '../components/UI/Card';

// Definimos la interfaz para las props de CardContainer
interface CardContainerProps {
  cards: CardData[];
}

const ProductsCard: React.FC<CardContainerProps> = ({ cards }) => {
  return (
    <div style={styles.container}>
      {cards.map((card) => (
        <Card key={card.id} title={card.title} value={card.value} icon={card.icon} />
      ))}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: '16px',
    padding: '16px',
  },
};

export default ProductsCard;