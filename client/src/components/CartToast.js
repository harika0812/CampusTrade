const CartToast = ({ message, type = "success" }) => {
  if (!message) return null;

  return (
    <div className={`cart-toast ${type}`} role="status" aria-live="polite">
      <span className="cart-toast-icon" aria-hidden="true">🛒</span>
      <span>{message}</span>
    </div>
  );
};

export default CartToast;
