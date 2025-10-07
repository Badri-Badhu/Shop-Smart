import { useEffect } from "react";
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";

const FlashMessage = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(); // Auto close after 3s
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const iconMap = {
    success: <CheckCircleIcon className="w-5 h-5 text-white mr-2" />,
    error: <XCircleIcon className="w-5 h-5 text-white mr-2" />,
    warning: <ExclamationTriangleIcon className="w-5 h-5 text-white mr-2" />,
  };

  const bgColor =
    type === "success"
      ? "bg-green-600"
      : type === "error"
      ? "bg-red-600"
      : "bg-yellow-500";

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center px-4 py-2 text-white rounded shadow-md text-sm font-medium transition-opacity duration-300 ${bgColor}`}>
      {iconMap[type]}
      <span>{message}</span>
    </div>
  );
};

export default FlashMessage;
