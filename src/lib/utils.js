import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

export const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId);
  if (element) {
    // Offset for fixed Navbar (80px) + StockTicker (40px)
    const headerOffset = 120; 
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth"
    });
  }
};