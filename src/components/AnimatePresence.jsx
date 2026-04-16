import React from 'react';
import { AnimatePresence as FramerAnimatePresence } from 'framer-motion';

const AnimatePresence = ({ children, ...props }) => {
  return <FramerAnimatePresence {...props}>{children}</FramerAnimatePresence>;
};

export default AnimatePresence;