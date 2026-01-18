import React, { useState, useRef, useEffect } from 'react';

/**
 * Autocomplete Component
 * 
 * A dropdown with typing support - shows suggestions while allowing custom input
 */
function Autocomplete({
    value,
    onChange,
    options,
    placeholder,
    displayKey = 'name',
    className = '',
    onSelect
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [filteredOptions, setFilteredOptions] = useState(options);
    const wrapperRef = useRef(null);

    // Filter options based on input
    useEffect(() => {
        if (value) {
            const filtered = options.filter(opt =>
                opt[displayKey].toLowerCase().includes(value.toLowerCase())
            );
            setFilteredOptions(filtered);
        } else {
            setFilteredOptions(options);
        }
    }, [value, options, displayKey]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e) => {
        onChange(e.target.value);
        setIsOpen(true);
    };

    const handleOptionClick = (option) => {
        onChange(option[displayKey]);
        if (onSelect) {
            onSelect(option);
        }
        setIsOpen(false);
    };

    const handleFocus = () => {
        setIsOpen(true);
    };

    return (
        <div className={`autocomplete-wrapper ${className}`} ref={wrapperRef}>
            <input
                type="text"
                className="input-field autocomplete-input"
                value={value}
                onChange={handleInputChange}
                onFocus={handleFocus}
                placeholder={placeholder}
                autoComplete="off"
            />

            {isOpen && filteredOptions.length > 0 && (
                <ul className="autocomplete-dropdown">
                    {filteredOptions.map((option, index) => (
                        <li
                            key={option.id || index}
                            className="autocomplete-option"
                            onClick={() => handleOptionClick(option)}
                        >
                            {option.displayName || option[displayKey]}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Autocomplete;
