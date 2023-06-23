import { useState, useRef, useCallback, useEffect } from 'react';

const useDropdown = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef();
    const dropdownHandleRef = useRef();

    const toggleDropdown = useCallback(() => {
        setShowDropdown(prevShowDropdown => !prevShowDropdown);
    }, []);

    const hideDropdownOnClickOutside = useCallback(event => {
        if(
            showDropdown
            && dropdownRef.current
            && !dropdownRef.current.contains(event.target)
            && (dropdownHandleRef.current && dropdownHandleRef.current !== event.target)
        ) {
            toggleDropdown();
        }
    }, [showDropdown, toggleDropdown]);

    useEffect(() => {
        document.addEventListener('mousedown', hideDropdownOnClickOutside);
        if(dropdownHandleRef.current) {
            dropdownHandleRef.current.addEventListener('click', toggleDropdown);
        }
    }, [hideDropdownOnClickOutside, toggleDropdown]);

    return {
        showDropdown,
        dropdownRef,
        dropdownHandleRef,
        toggleDropdown
    };
};

export default useDropdown;