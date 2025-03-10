import React from 'react';

// Definimos una interfaz para las props
interface CardProps {
  title: string;
  value: number; // Aquí especificamos que `value` es de tipo number
  icon: string;
}

const Card: React.FC<CardProps> = ({ title, value, icon }) => {
  return (
    <div style={styles.card}>
      <img src={icon} alt={title} style={styles.icon} />
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  );
};

const styles = {
  card: {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center',
    width: '150px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  icon: {
    width: '50px',
    height: '50px',
  },
};

export default Card;