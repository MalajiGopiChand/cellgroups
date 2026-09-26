import React, { Fragment } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { ChevronDown as ChevronDownIcon, CalendarToday as CalendarIcon } from '@mui/icons-material';
import { Box } from '@mui/material';

export default function HeadlessWeekSelector({ weeks, selectedWeek, onSelect, currentWeek }) {
  return (
    <Box sx={{ position: 'relative', zIndex: 10 }}>
      <Menu>
        <MenuButton as={Fragment}>
          {({ active }) => (
            <button
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '8px',
                backgroundColor: active ? 'var(--bg-glass-strong)' : '#ffffff',
                padding: '8px 16px',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-deep)',
                border: '1px solid var(--border-neutral)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                outline: 'none'
              }}
            >
              <CalendarIcon sx={{ fontSize: 16, color: 'var(--primary-forest)' }} />
              {new Date(selectedWeek).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              {selectedWeek === currentWeek ? ' (Current)' : ''}
              <ChevronDownIcon sx={{ fontSize: 18, color: 'var(--text-secondary)' }} />
            </button>
          )}
        </MenuButton>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <MenuItems
            style={{
              position: 'absolute',
              right: 0,
              top: '110%',
              width: '220px',
              transformOrigin: 'top right',
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              border: '1px solid var(--border-light)',
              padding: '4px',
              outline: 'none',
              maxHeight: '300px',
              overflowY: 'auto'
            }}
          >
            {weeks.map((week) => (
              <MenuItem key={week}>
                {({ focus }) => (
                  <button
                    onClick={() => onSelect(week)}
                    style={{
                      display: 'flex',
                      width: '100%',
                      alignItems: 'center',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '0.875rem',
                      fontWeight: selectedWeek === week ? 700 : 500,
                      color: selectedWeek === week ? 'var(--primary-forest)' : 'var(--text-deep)',
                      backgroundColor: focus ? 'rgba(16,185,129,0.08)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    {new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {week === currentWeek ? ' (Current)' : ''}
                  </button>
                )}
              </MenuItem>
            ))}
          </MenuItems>
        </Transition>
      </Menu>
    </Box>
  );
}
