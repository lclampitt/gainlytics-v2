import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ConfirmDialog.css';

/**
 * Shared confirmation dialog. Use for destructive or one-tap
 * primary confirmations — the workout-logger end/discard modals
 * are the reference design. Backdrop click and the secondary
 * button both route to onSecondary so there's no ambiguity
 * about how to bail out.
 */
export default function ConfirmDialog({
  open,
  title,
  body,
  primaryLabel,
  onPrimary,
  secondaryLabel = 'Cancel',
  onSecondary,
  destructive = false,
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="cd-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onSecondary}
          role="presentation"
        >
          <motion.div
            className="cd-dialog"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <h4 className="cd-title">{title}</h4>
            {body && <p className="cd-body">{body}</p>}
            <div className="cd-actions">
              <motion.button
                type="button"
                className={`cd-primary${destructive ? ' cd-primary--destructive' : ''}`}
                onClick={onPrimary}
                whileTap={{ scale: 0.97 }}
              >
                {primaryLabel}
              </motion.button>
              <motion.button
                type="button"
                className="cd-secondary"
                onClick={onSecondary}
                whileTap={{ scale: 0.97 }}
              >
                {secondaryLabel}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
