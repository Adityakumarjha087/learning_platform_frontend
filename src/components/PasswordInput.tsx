'use client';

import React, { useState } from 'react';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';

type PasswordInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>;

// Password field with a button that reveals or hides what was typed.
const PasswordInput: React.FC<PasswordInputProps> = ({ className = '', ...inputProps }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...inputProps}
        type={visible ? 'text' : 'password'}
        className={`${className} pr-11`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        {visible ? <EyeInvisibleOutlined aria-hidden="true" /> : <EyeOutlined aria-hidden="true" />}
      </button>
    </div>
  );
};

export default PasswordInput;
