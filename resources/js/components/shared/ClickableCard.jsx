import React from 'react';
import { Link } from 'react-router-dom';

const baseClass =
    'block w-full text-left bg-white rounded-xl border border-gray-200 transition-all select-none ' +
    'hover:shadow-md hover:border-gray-300 active:scale-[0.98] active:shadow-lg';

const ClickableCard = ({ to, onClick, children, className = '', ariaLabel }) => {
    const cls = `${baseClass} ${className}`;

    if (to) {
        return (
            <Link to={to} className={cls} aria-label={ariaLabel}>
                {children}
            </Link>
        );
    }

    if (onClick) {
        return (
            <button type="button" onClick={onClick} className={cls} aria-label={ariaLabel}>
                {children}
            </button>
        );
    }

    return (
        <div className={`bg-white rounded-xl border border-gray-200 ${className}`}>
            {children}
        </div>
    );
};

export default ClickableCard;
