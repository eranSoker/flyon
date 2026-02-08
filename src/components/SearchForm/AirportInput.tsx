// FlyOn — AirportInput Component v1.3.1 | 2026-02-06

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAirportSearch } from '@/hooks/useAirportSearch';
import type { Airport } from '@/lib/types';
import styles from './AirportInput.module.css';

interface AirportInputProps {
  label: string;
  placeholder: string;
  value: Airport | null;
  onChange: (airport: Airport | null) => void;
}

export default function AirportInput({ label, placeholder, value, onChange }: AirportInputProps) {
  const [inputValue, setInputValue] = useState(value ? `${value.cityName} (${value.iataCode})` : '');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const { results, loading, search } = useAirportSearch();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) {
      setInputValue(`${value.cityName} (${value.iataCode})`);
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    search(val);
    setIsOpen(true);
    setHighlightedIndex(-1);
    if (!val) {
      onChange(null);
    }
  }, [search, onChange]);

  const handleSelect = useCallback((airport: Airport) => {
    onChange(airport);
    setInputValue(`${airport.cityName} (${airport.iataCode})`);
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < results.length) {
          handleSelect(results[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  }, [isOpen, results, highlightedIndex, handleSelect]);

  const handleFocus = useCallback(() => {
    if (results.length > 0) {
      setIsOpen(true);
    }
    // Select all text on focus for easy replacement
    inputRef.current?.select();
  }, [results]);

  return (
    <div className={styles.container} ref={containerRef}>
      <label className={styles.label}>{label}</label>
      <div className={styles.inputWrapper}>
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-label={label}
        />
        {loading && <span className={styles.spinner} aria-label="Loading" />}
      </div>
      {isOpen && results.length > 0 && (
        <ul className={styles.dropdown} role="listbox">
          {results.map((airport, index) => (
            <li
              key={airport.iataCode}
              className={`${styles.option} ${index === highlightedIndex ? styles.highlighted : ''}`}
              role="option"
              aria-selected={index === highlightedIndex}
              onMouseDown={() => handleSelect(airport)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <span className={styles.optionCode}>{airport.iataCode}</span>
              <span className={styles.optionInfo}>
                <span className={styles.optionCity}>{airport.cityName}</span>
                <span className={styles.optionName}>{airport.name}</span>
              </span>
              <span className={styles.optionCountry}>{airport.countryName || airport.countryCode}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
