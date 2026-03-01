import React from 'react';

const InlineFieldError = ({ error }) => {
    if (!error) return null;
    const message = Array.isArray(error) ? error[0] : error;
    return <p className="text-xs text-red-600 mt-1">{message}</p>;
};

export default InlineFieldError;
