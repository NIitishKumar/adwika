import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CurrencyConfig } from '@/types';
import { CartDrawer } from '../CartDrawer';

interface CartPageProps {
  currency: CurrencyConfig;
  onOpenAccountModal?: () => void;
}

export const CartPage: React.FC<CartPageProps> = ({
  currency,
  onOpenAccountModal,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <CartDrawer
      currency={currency}
      isStandalonePage={true}
      onExplore={() => navigate('/')}
      onOpenAccountModal={onOpenAccountModal}
    />
  );
};

export default CartPage;
