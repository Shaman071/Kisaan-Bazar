import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaGlobe } from 'react-icons/fa';

const LanguageSelector = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (e) => {
        const langCode = e.target.value;
        i18n.changeLanguage(langCode);
        localStorage.setItem("lang", langCode);
    };

    return (
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-2 py-1">
            <FaGlobe className="text-gray-600" />
            <select
                onChange={changeLanguage}
                value={i18n.language}
                className="bg-transparent text-sm text-gray-700 font-medium focus:outline-none cursor-pointer"
            >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="kn">ಕನ್ನಡ</option>
            </select>
        </div>
    );
};

export default LanguageSelector;
