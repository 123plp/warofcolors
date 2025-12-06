import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// This file now redirects to the new DEF-DEV docs index
const DefDevDocs = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate("/docs/def-dev", { replace: true });
  }, [navigate]);
  
  return null;
};

export default DefDevDocs;
