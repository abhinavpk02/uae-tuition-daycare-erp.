import React, { useState, useRef } from 'react';
import { Trash2 } from 'lucide-react';

export default function SwipeableTableRow({ children, onDelete, deleteLabel = "Delete Record" }) {
  const [translateX, setTranslateX] = useState(0);
  const [isSwiped, setIsSwiped] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const touchStartX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);

  // Touch event handlers for mobile devices
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current) return;
    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - touchStartX.current;

    if (diff < 0) {
      // Swiping left
      setTranslateX(Math.max(diff, -110));
    } else if (diff > 0 && isSwiped) {
      // Swiping right to close
      setTranslateX(Math.min(-110 + diff, 0));
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    if (translateX < -50) {
      setTranslateX(-110);
      setIsSwiped(true);
    } else {
      setTranslateX(0);
      setIsSwiped(false);
    }
  };

  // Mouse event handlers for desktop horizontal drag
  const handleMouseDown = (e) => {
    touchStartX.current = e.clientX;
    isDragging.current = true;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    currentX.current = e.clientX;
    const diff = currentX.current - touchStartX.current;

    if (diff < 0) {
      setTranslateX(Math.max(diff, -110));
    } else if (diff > 0 && isSwiped) {
      setTranslateX(Math.min(-110 + diff, 0));
    }
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (translateX < -50) {
      setTranslateX(-110);
      setIsSwiped(true);
    } else {
      setTranslateX(0);
      setIsSwiped(false);
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (onDelete) {
      setIsDeleting(true);
      setTimeout(() => {
        onDelete();
      }, 250);
    }
  };

  return (
    <tr 
      style={{
        position: 'relative',
        transition: isDeleting ? 'all 0.3s ease' : 'none',
        opacity: isDeleting ? 0 : 1,
        transform: isDeleting ? 'scale(0.95)' : 'none',
        userSelect: 'none'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Table Row Content Overlay with Horizontal Slide */}
      {React.Children.map(children, (child, idx) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            style: {
              ...(child.props.style || {}),
              transform: `translateX(${translateX}px)`,
              transition: isDragging.current ? 'none' : 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              background: isSwiped ? 'var(--card-bg-subtle)' : undefined
            }
          });
        }
        return child;
      })}

      {/* Revealed Swipe Action Button on Right */}
      <td 
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '110px',
          padding: 0,
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#EF4444',
          color: '#FFFFFF',
          cursor: 'pointer',
          zIndex: 10,
          opacity: Math.min(Math.abs(translateX) / 100, 1),
          pointerEvents: translateX < -30 ? 'auto' : 'none',
          transition: 'opacity 0.2s ease',
          borderTopRightRadius: '8px',
          borderBottomRightRadius: '8px'
        }}
        onClick={handleDeleteClick}
        title={deleteLabel}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700 }}>
          <Trash2 size={16} /> Delete
        </div>
      </td>
    </tr>
  );
}
