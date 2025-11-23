import React from 'react';

interface ConsentCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  privacyPolicyUrl?: string;
  error?: string;
  required?: boolean;
}

export const ConsentCheckbox: React.FC<ConsentCheckboxProps> = ({
  checked,
  onChange,
  privacyPolicyUrl,
  error,
  required = true,
}) => {
  const consentText = privacyPolicyUrl ? (
    <>
      Я даю согласие на обработку моих персональных данных в соответствии с{' '}
      <a
        href={privacyPolicyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 underline"
        onClick={(e) => e.stopPropagation()}
      >
        политикой конфиденциальности
      </a>
    </>
  ) : (
    'Я даю согласие на обработку моих персональных данных'
  );

  return (
    <div>
      <label className="flex items-start gap-2 text-sm text-white/70 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          required={required}
          className="mt-1 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
        />
        <span className={error ? 'text-red-400' : ''}>
          {consentText}
          {required && <span className="text-red-400 ml-1">*</span>}
        </span>
      </label>
      {error && <p className="text-xs text-red-400 mt-1 ml-6">{error}</p>}
    </div>
  );
};

