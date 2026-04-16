// Note: This file content is deliberately replaced with a redirect or empty component
// because the user requested to delete it, but the system only allows overwriting.
// The App.jsx no longer imports or uses this file, so it is effectively removed from the build.

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProductsPage = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/plans');
  }, [navigate]);

  return null;
};

export default ProductsPage;