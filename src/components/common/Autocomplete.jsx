import React, { useState, useRef, useEffect } from 'react';
import { IconChevronDown } from './Icons';

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
    placeholderSub,
    displayKey = 'name',
    className = '',
    onSelect,
    showSubs = false
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [filteredOptions, setFilteredOptions] = useState(options);
    const wrapperRef = useRef(null);

    const normalizeBasic = (text) => {
        return String(text || '')
            .toLowerCase()
            .replace(/[\s\-_/.,]+/g, '');
    };

    const normalizeTanglish = (text) => {
        let s = normalizeBasic(text);
        if (!s) return s;

        // Common digraph/variant folding
        s = s
            .replace(/aa/g, 'a')
            .replace(/ee/g, 'e')
            .replace(/ii/g, 'i')
            .replace(/oo/g, 'o')
            .replace(/uu/g, 'u')
            .replace(/ph/g, 'f')
            .replace(/bh/g, 'b')
            .replace(/dh/g, 'd')
            .replace(/th/g, 't')
            .replace(/kh/g, 'k')
            .replace(/gh/g, 'g')
            .replace(/ch/g, 's')
            .replace(/sh/g, 's')
            .replace(/zh/g, 'l')
            .replace(/j/g, 's')
            .replace(/c/g, 's')
            .replace(/z/g, 's')
            .replace(/ng/g, 'n')
            .replace(/nj/g, 'n')
            .replace(/rr/g, 'r')
            .replace(/ll/g, 'l')
            .replace(/nn/g, 'n')
            .replace(/bb/g, 'b')
            .replace(/pp/g, 'p')
            .replace(/ff/g, 'f');

        // Fold common consonant confusions
        s = s
            .replace(/b/g, 'p')
            .replace(/f/g, 'p')
            .replace(/d/g, 't')
            .replace(/g/g, 'k')
            .replace(/v/g, 'w');

        // Collapse remaining duplicate letters
        s = s.replace(/(.)\1+/g, '$1');

        return s;
    };

    const consonantSkeleton = (text) => {
        return normalizeTanglish(text).replace(/[aeiou]/g, '');
    };

    const normalizeTamil = (text) => {
        const str = String(text || '');
        // Normalize similar letters and strip vowel signs/pulli for matching
        const mapped = str
            .replace(/[ணன]/g, 'ந')
            .replace(/[ளழ]/g, 'ல')
            .replace(/[ற]/g, 'ர')
            .replace(/[ஶஷ]/g, 'ச');

        return mapped
            .replace(/[\u0BBE-\u0BCD]/g, '') // remove vowel signs + pulli
            .replace(/[\s\-_/.,]+/g, '')
            .toLowerCase();
    };

    const latinizeTamil = (text) => {
        const str = String(text || '');
        const vowels = {
            'அ': 'a', 'ஆ': 'aa', 'இ': 'i', 'ஈ': 'ii', 'உ': 'u', 'ஊ': 'uu',
            'எ': 'e', 'ஏ': 'ee', 'ஐ': 'ai', 'ஒ': 'o', 'ஓ': 'oo', 'ஔ': 'au'
        };
        const consonants = {
            'க': 'k', 'ங': 'ng', 'ச': 's', 'ஞ': 'nj', 'ட': 'd', 'ண': 'n',
            'த': 'th', 'ந': 'n', 'ப': 'p', 'ம': 'm', 'ய': 'y', 'ர': 'r',
            'ல': 'l', 'வ': 'v', 'ள': 'l', 'ழ': 'zh', 'ற': 'r', 'ன': 'n',
            'ஜ': 'j', 'ஷ': 'sh', 'ஸ': 's', 'ஹ': 'h', 'ஶ': 'sh'
        };
        const vowelSigns = {
            'ா': 'aa', 'ி': 'i', 'ீ': 'ii', 'ு': 'u', 'ூ': 'uu',
            'ெ': 'e', 'ே': 'ee', 'ை': 'ai', 'ொ': 'o', 'ோ': 'oo', 'ௌ': 'au'
        };

        let out = '';
        for (let i = 0; i < str.length; i++) {
            const ch = str[i];
            if (vowels[ch]) {
                out += vowels[ch];
                continue;
            }
            if (consonants[ch]) {
                const base = consonants[ch];
                const next = str[i + 1];
                if (vowelSigns[next]) {
                    out += base + vowelSigns[next];
                    i += 1;
                } else if (next === '்') {
                    out += base;
                    i += 1;
                } else {
                    out += base + 'a';
                }
                continue;
            }
            if (/[a-zA-Z0-9]/.test(ch)) {
                out += ch.toLowerCase();
                continue;
            }
        }
        return out.replace(/[\s\-_/.,]+/g, '');
    };

    const getSearchHaystack = (opt) => {
        const base = opt?.searchText ?? opt?.[displayKey] ?? '';
        const raw = String(base || '').toLowerCase();
        const norm = normalizeTamil(base);
        const latin = latinizeTamil(base);
        const latinNorm = normalizeTanglish(latin);
        const latinSkel = consonantSkeleton(latin);
        return [raw, norm, latin, latinNorm, latinSkel].filter(Boolean);
    };

    const getSearchNeedles = (input) => {
        const raw = String(input || '').toLowerCase().trim();
        if (!raw) return [];
        const basic = normalizeBasic(raw);
        const tamil = normalizeTamil(raw);
        const latin = latinizeTamil(raw);
        const tanglish = normalizeTanglish(raw);
        const tanglishSkel = consonantSkeleton(raw);
        const latinNorm = normalizeTanglish(latin);
        const latinSkel = consonantSkeleton(latin);
        return [raw, basic, tamil, latin, tanglish, tanglishSkel, latinNorm, latinSkel].filter(Boolean);
    };

    // Filter options based on input
    useEffect(() => {
        if (value) {
            const needles = getSearchNeedles(value);
            const filtered = options.filter(opt => {
                const haystack = getSearchHaystack(opt);
                if (haystack.length === 0) return false;
                return needles.some(n => haystack.some(h => h.includes(n)));
            });
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
        setIsFocused(true);
    };

    const handleBlur = () => {
        // Delay to allow clicking options
        setTimeout(() => {
            setIsFocused(false);
            // Auto-correct to a clean option if there's an exact normalized match
            const needles = getSearchNeedles(value);
            if (!needles.length) return;
            const match = options.find(opt => {
                const haystack = getSearchHaystack(opt);
                return haystack.some(h => needles.some(n => h === n));
            });
            if (match) {
                onChange(match[displayKey]);
                if (onSelect) onSelect(match);
            }
        }, 200);
    };

    const renderHighlightedText = (text, query) => {
        if (!query) return text;
        const safeText = String(text);
        const safeQuery = String(query).trim();
        if (!safeQuery) return safeText;

        const lowerText = safeText.toLowerCase();
        const lowerQuery = safeQuery.toLowerCase();
        const idx = lowerText.indexOf(lowerQuery);
        if (idx === -1) return safeText;

        const before = safeText.slice(0, idx);
        const match = safeText.slice(idx, idx + safeQuery.length);
        const after = safeText.slice(idx + safeQuery.length);

        return (
            <>
                {before}
                <mark>{match}</mark>
                {after}
            </>
        );
    };

    const toggleDropdown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    return (
        <div className={`autocomplete-wrapper ${className} ${isOpen ? 'open' : ''}`} ref={wrapperRef}>
            <input
                type="text"
                className="input-field autocomplete-input"
                value={value}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={(!showSubs || !placeholderSub) ? placeholder : ''}
                autoComplete="off"
            />

            {showSubs && placeholderSub && !value && !isFocused && (
                <div className="dual-placeholder-overlay">
                    <span className="dual-placeholder-primary">{placeholder}</span>
                    <span className="dual-placeholder-sub">{placeholderSub}</span>
                </div>
            )}

            <button
                type="button"
                className="autocomplete-toggle-btn"
                onClick={toggleDropdown}
                tabIndex="-1"
                aria-label="Toggle dropdown"
            >
                <IconChevronDown size={14} />
            </button>

            {isOpen && filteredOptions.length > 0 && (
                <ul className="autocomplete-dropdown">
                    {filteredOptions.map((option, index) => (
                        <li
                            key={option.id || index}
                            className="autocomplete-option"
                            onClick={() => handleOptionClick(option)}
                        >
                            {option.displayName || renderHighlightedText(option[displayKey], value)}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Autocomplete;
